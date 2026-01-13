---
title: "Build an Offline CLI Assistant with a Tiny LLM and Local Embeddings"
date: "2026-01-13"
tags: ['Python','LLM','RAG']

---
In an era of massive cloud models, there is something incredibly satisfying about running your own AI stack entirely on your local machine. No API keys, no monthly bills, and complete privacy.

This weekend project guides you through building a **Retrieval Augmented Generation (RAG)** CLI tool. We will create a command-line assistant that can ingest your local documents (notes, documentation, or code) and answer questions about them using a tiny LLM and lightweight embeddings.

## The Stack

To keep this lightweight and laptop-friendly, we will use:

*   **Ollama**: To serve the LLM (e.g., Llama 3 or Phi-3) locally.
*   **Sentence-Transformers**: For creating lightweight vector embeddings.
*   **ChromaDB**: An open-source, embedded vector database.
*   **Typer & Rich**: For building a beautiful CLI interface.

## Step 1: Environment Setup

First, ensure you have [Ollama installed](https://ollama.com/) and running. Pull a small, efficient model. `phi3:mini` (3.8GB) or `llama3:8b` are excellent choices for consumer hardware.

```bash
ollama pull phi3:mini
```

Next, create a Python virtual environment and install the dependencies:

```bash
pip install chromadb sentence-transformers typer rich requests
```

## Step 2: Ingesting and Embedding Documents

We need a script to read your text files, convert them into vector embeddings, and store them. We will use the `all-MiniLM-L6-v2` model for embeddings; it is tiny (80MB), fast, and performs surprisingly well for English text.

Create a file named `ingest.py`:

```python
import os
import chromadb
from sentence_transformers import SentenceTransformer

def ingest_docs(folder_path):
    # Initialize local vector DB
    client = chromadb.PersistentClient(path="./db")
    collection = client.get_or_create_collection(name="local_docs")
    
    # Load embedding model
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    documents = []
    metadatas = []
    ids = []
    
    print(f"Scanning {folder_path}...")
    
    for root, _, files in os.walk(folder_path):
        for file in files:
            if file.endswith(".md") or file.endswith(".txt"):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    text = f.read()
                    # Simple chunking by paragraph for this example
                    chunks = text.split('\n\n')
                    for i, chunk in enumerate(chunks):
                        if len(chunk) > 50:
                            documents.append(chunk)
                            metadatas.append({"source": file})
                            ids.append(f"{file}_{i}")

    # Embed and store
    if documents:
        print("Embedding documents... this may take a moment.")
        embeddings = model.encode(documents).tolist()
        collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        print(f"Indexed {len(documents)} chunks.")

if __name__ == "__main__":
    ingest_docs("./my_notes")
```

## Step 3: The Retrieval Loop

Now for the brain of the CLI. We need to query the database, find relevant context, and send it to the LLM.

Create `main.py`:

```python
import typer
import chromadb
import requests
import json
from sentence_transformers import SentenceTransformer
from rich.console import Console
from rich.markdown import Markdown

app = typer.Typer()
console = Console()

# Setup Global Clients
chroma_client = chromadb.PersistentClient(path="./db")
collection = chroma_client.get_collection(name="local_docs")
embed_model = SentenceTransformer('all-MiniLM-L6-v2')

def query_ollama(prompt, context):
    url = "http://localhost:11434/api/generate"
    
    # The RAG Prompt
    full_prompt = f"""
    You are a helpful assistant. Use the following context to answer the question.
    
    Context:
    {context}
    
    Question: {prompt}
    """
    
    payload = {
        "model": "phi3:mini",
        "prompt": full_prompt,
        "stream": False
    }
    
    response = requests.post(url, json=payload)
    return response.json()['response']

@app.command()
def ask(question: str):
    with console.status("[bold green]Searching knowledge base..."):
        # 1. Embed the query
        query_embed = embed_model.encode([question]).tolist()
        
        # 2. Retrieve top 3 relevant chunks
        results = collection.query(
            query_embeddings=query_embed,
            n_results=3
        )
        
        context_text = "\n".join(results['documents'][0])

    with console.status("[bold yellow]Thinking..."):
        # 3. Generate Answer
        answer = query_ollama(question, context_text)
    
    console.print(Markdown(f"## Answer\n{answer}"))
    console.print("[dim]Sources: " + ", ".join([m['source'] for m in results['metadatas'][0]]) + "[/dim]")

if __name__ == "__main__":
    app()
```

## Optimization for Low RAM

To run this smoothly on a laptop with 8GB or 16GB of RAM:

1.  **Quantization**: Use 4-bit quantized models in Ollama (default). They use significantly less RAM with minimal precision loss.
2.  **Lazy Loading**: The script above loads the embedding model into memory every time you run the command. For a snappier experience, consider wrapping this in a `while True` loop to keep the model loaded in RAM.

## Usage

1.  Put some markdown files in a folder called `my_notes`.
2.  Run ingestion: `python ingest.py`
3.  Ask a question: `python main.py ask "What did I write about project X?"`

You now have a fully offline, private Search-and-Chat tool. You can extend this by adding support for PDF parsing or building a persistent chat history.
