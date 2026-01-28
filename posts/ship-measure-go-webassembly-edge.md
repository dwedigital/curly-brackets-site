---
title: "Ship & Measure: Go WebAssembly at the Edge"
date: "2026-01-28"
tags: ['Edge Computing','Go','Performance']

---
Serverless functions promised us an infrastructure-free future, but the "cold start" tax—the time it takes for a cloud provider to spin up a container—often kills the vibe for low-latency applications. Enter WebAssembly (Wasm) at the Edge.

In this weekend project, we are going to compile a tiny Go handler to WebAssembly (specifically WASI), deploy it to two different edge environments (Cloudflare Workers and Fermyon/Akamai), and measure the real-world performance. 

## Why WebAssembly?

Unlike containers, Wasm modules are platform-agnostic binaries that start up in microseconds. Because they run in a secure sandbox with a capability-based security model, providers can pack thousands of them onto a single machine without the overhead of full OS virtualization.

## Prerequisites

For this tutorial, we will use **Go** because of its strong typing and the **TinyGo** compiler, which is essential for shrinking binary sizes to acceptable edge limits.

1.  **Go** installed (1.19+)
2.  **TinyGo** installed (Standard Go binaries are too large for this specific use case)
3.  **Spin CLI** (for Fermyon)
4.  **Wrangler** (for Cloudflare)

## Step 1: The Code

Let's write a simple HTTP handler. We aren't building a complex API; we just want to echo a response to measure the round-trip time.

Create a file named `main.go`:

```go
package main

import (
	"fmt"
	"net/http"
	spin_http "github.com/fermyon/spin/sdk/go/v2/http"
)

func init() {
	spin_http.Handle(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		fmt.Fprintln(w, "Hello from the Edge!")
	})
}

func main() {}
```

*Note: We are using the Spin SDK here for the WASI interface, which standardizes how HTTP requests enter the Wasm module.*

## Step 2: Compiling with TinyGo

If you compile this with standard `go build`, you might get a binary around 2MB+. For edge networks, every kilobyte counts. TinyGo strips away the overhead.

```bash
tinygo build -target=wasi -o main.wasm main.go
```

You should see a `main.wasm` file that is drastically smaller (often under 500KB).

## Step 3: Deploying to Fermyon (Spin)

Fermyon Cloud (and Akamai Connected Cloud) runs Wasm natively using Wasmtime. This is a "pure" Wasm environment.

1.  Initialize a `spin.toml` file:
    ```toml
    spin_manifest_version = 2

    [application]
    name = "wasm-edge-demo"
    version = "0.1.0"

    [[trigger.http]]
    route = "/..."
    component = "main"

    [component.main]
    source = "main.wasm"
    ```

2.  Deploy:
    ```bash
    spin deploy
    ```

## Step 4: Deploying to Cloudflare Workers

Cloudflare Workers runs on V8 Isolates. While they support Wasm, it's usually invoked via JavaScript. This adds a layer of "glue code," but Cloudflare's network is ubiquitous.

1.  Create a `wrangler.toml`:
    ```toml
    name = "wasm-edge-demo"
    main = "src/worker.js"
    compatibility_date = "2023-10-02"

    [[rules]]
    type = "CompiledWasm"
    globs = ["**/*.wasm"]
    fallthrough = false
    ```

2.  Create `src/worker.js` to load the Wasm:
    ```javascript
    import wasm from '../main.wasm';

    export default {
      async fetch(request, env, ctx) {
        const instance = await WebAssembly.instantiate(wasm);
        // Note: You would typically map JS imports to Go exports here
        // For this demo, we assume a simple start.
        return new Response("Hello from Cloudflare Wasm");
      }
    };
    ```

3.  Deploy:
    ```bash
    npx wrangler deploy
    ```

## Step 5: Measuring Cold Starts

Now for the fun part. We want to measure the "Time to First Byte" (TTFB) on a cold request. A "cold" request implies the function hasn't been called recently, forcing the provider to boot it up.

We can use `curl` with a custom format to expose timing details:

```bash
curl -w "Connect: %{time_connect} TTFB: %{time_starttransfer} Total: %{time_total}\n" -o /dev/null -s https://your-endpoint.com
```

### The Benchmarking Strategy

1.  **Wait 10 minutes** to ensure the instance is cold.
2.  Run the curl command. Record the `TTFB`.
3.  Run the command immediately again (Warm start). Record the `TTFB`.

## Results & Ergonomics

While your results will vary based on geography, here is what you will likely observe:

*   **Cloudflare Workers:** Extremely fast cold starts (often < 50ms) due to the V8 Isolate architecture. However, the ergonomics of bridging Go and JS can be tricky without tools like `syscall/js`.
*   **Fermyon/Spin:** Cold starts are slightly higher but still sub-second (usually 100-300ms). The developer ergonomics for Go are superior here because the environment is designed specifically for WASI—no JavaScript glue required.

## Conclusion

If you need absolute lowest latency and don't mind writing TypeScript glue, Cloudflare is hard to beat. However, if you want to write pure Go (or Python/Rust) and ship a binary directly to the edge with a Docker-like experience, the WASI ecosystem (Spin/Akamai) offers a fantastic developer experience with very respectable performance.
