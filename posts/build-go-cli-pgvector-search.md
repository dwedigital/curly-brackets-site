---
title: "Make a fast Go CLI to index and fuzzy-search your codebase with pgvector"
date: "2026-01-16"
tags: ['Go','Vector Databases','CLI']

---
Developers love searchable code. We rely heavily on `grep` or IDE search tools, but those usually depend on exact keyword matching. What if you could ask your codebase, "Where is the authentication logic handled?" and get relevant results even if the word "authentication" never appears in the file?

In this tutorial, we will build a lightning-fast Go CLI that scans a repository, computes embeddings using OpenAI, stores them in Postgres with `pgvector`, and provides a fuzzy-search command. We'll cover embedding batching, safe upserts, and HNSW index tuning.

## Prerequisites

- **Go 1.21+** installed.
- **Docker** (to run Postgres).
- An **OpenAI API Key** (for generating embeddings).

## Step 1: Setting up Postgres with pgvector

First, we need a database that supports vector operations. The easiest way to get started is using the official `pgvector` Docker image.

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: codesearch
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Run `docker-compose up -d`. Once running, connect to the database and enable the extension and create our table:

```sql
-- Enable the extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the table
CREATE TABLE code_chunks (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536) -- 1536 is the dimension for text-embedding-3-small
);

-- Create an HNSW index for fast approximate nearest neighbor search
CREATE INDEX ON code_chunks USING hnsw (embedding vector_cosine_ops);
```

## Step 2: The Go Project Structure

Initialize your project:

```bash
mkdir go-code-search
cd go-code-search
go mod init go-code-search
go get github.com/jackc/pgx/v5
go get github.com/sashabaranov/go-openai
go get github.com/spf13/cobra
```

## Step 3: Indexing the Codebase

The most complex part is scanning files and batching them for embedding generation. We want to avoid hitting API rate limits and ensure network efficiency.

Here is a simplified version of the indexing logic. We will walk the directory, read files, and upsert them into Postgres.

```go
package main

import (
    "context"
    "crypto/sha256"
    "encoding/hex"
    "fmt"
    "os"
    "path/filepath"
    "strings"

    "github.com/jackc/pgx/v5"
    "github.com/sashabaranov/go-openai"
)

func indexCodebase(dir string, dbUrl string, apiKey string) error {
    ctx := context.Background()
    client := openai.NewClient(apiKey)
    
    // Connect to DB
    conn, err := pgx.Connect(ctx, dbUrl)
    if err != nil { return err }
    defer conn.Close(ctx)

    return filepath.WalkDir(dir, func(path string, d os.DirEntry, err error) error {
        if err != nil || d.IsDir() { return nil }
        
        // Skip hidden files or non-code files (simplified)
        if strings.HasPrefix(d.Name(), ".") { return nil }

        contentBytes, err := os.ReadFile(path)
        if err != nil { return nil }
        content := string(contentBytes)

        // Generate a deterministic ID based on path so we can upsert safely
        hasher := sha256.New()
        hasher.Write([]byte(path))
        id := hex.EncodeToString(hasher.Sum(nil))

        // Get Embedding
        resp, err := client.CreateEmbeddings(ctx, openai.EmbeddingRequest{
            Input: []string{content},
            Model: openai.SmallEmbedding3,
        })
        if err != nil { return fmt.Errorf("embedding error: %v", err) }

        // Upsert into Postgres
        sql := `
            INSERT INTO code_chunks (id, path, content, embedding)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE 
            SET content = EXCLUDED.content, embedding = EXCLUDED.embedding
        `
        _, err = conn.Exec(ctx, sql, id, path, content, pgvector.NewVector(resp.Data[0].Embedding))
        if err != nil { return fmt.Errorf("db error: %v", err) }

        fmt.Printf("Indexed: %s\n", path)
        return nil
    })
}
```

*Note: In a production CLI, you should implement batching (sending 10-20 files per API call) to significantly speed up this process.*

## Step 4: Fuzzy Search with pgvector

Now for the fun part. We need to embed the user's query and compare it against our stored vectors using the `<=>` (cosine distance) operator.

```go
func searchCodebase(query string, dbUrl string, apiKey string) error {
    ctx := context.Background()
    client := openai.NewClient(apiKey)
    conn, err := pgx.Connect(ctx, dbUrl)
    if err != nil { return err }
    defer conn.Close(ctx)

    // 1. Embed the query
    resp, err := client.CreateEmbeddings(ctx, openai.EmbeddingRequest{
        Input: []string{query},
        Model: openai.SmallEmbedding3,
    })
    if err != nil { return err }

    vector := resp.Data[0].Embedding

    // 2. Search using Cosine Distance (<=>)
    // We cast the array to vector type for pgvector
    rows, err := conn.Query(ctx, `
        SELECT path, content, (embedding <=> $1) as distance 
        FROM code_chunks 
        ORDER BY distance ASC 
        LIMIT 3
    `, pgvector.NewVector(vector))
    if err != nil { return err }
    defer rows.Close()

    for rows.Next() {
        var path, content string
        var dist float64
        rows.Scan(&path, &content, &dist)
        fmt.Printf("\n--- Found in %s (Distance: %.4f) ---\n", path, dist)
        fmt.Println(content[:200] + "...") // Print preview
    }
    return nil
}
```

## Step 5: Optimization and Hybrid Search

While vector search is powerful for semantic meaning, it sometimes misses exact keyword matches (like specific function names). To make your CLI robust:

1.  **HNSW Tuning:** The `CREATE INDEX ... USING hnsw` command we ran earlier is crucial. Without it, Postgres performs a sequential scan (slow). With it, it traverses a graph (fast).
2.  **Hybrid Search:** You can combine `tsvector` (Postgres' native full-text search) with `pgvector`. A common pattern is to select the top 50 results from semantic search and the top 50 from keyword search, then re-rank them using a Reciprocal Rank Fusion (RRF) algorithm directly in your Go application.

## Conclusion

With less than 200 lines of Go code, you can build a tool that understands the *intent* of your code search, not just the syntax. This architecture—Go for the CLI, Postgres for storage, and pgvector for the math—is scalable and robust enough for a "weekend project" that might just become your team's favorite tool.
