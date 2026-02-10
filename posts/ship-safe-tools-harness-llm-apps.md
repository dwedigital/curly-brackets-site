---
title: "Ship a “Safe Tools” Harness for LLM Apps: Allowlists, Signed Manifests, and a Sandbox"
date: "2026-02-10"
tags: ['AI','Security','Python']

---
LLM Agents are shifting from novelty chat interfaces to actionable systems that can read files, query databases, and execute code. While this is powerful, it introduces a massive security surface. If an LLM is tricked via prompt injection into calling `delete_database()` instead of `query_database()`, or if it hallucinates a tool call that executes arbitrary code on your server, you have a problem.

In this weekend project, we are going to build a **Safe Tools Harness**. This is a middleware layer that sits between your LLM and your actual functions. It enforces three layers of defense:

1.  **Strict Allowlists:** Explicit permissioning for tool execution.
2.  **Signed Manifests:** Cryptographic verification that the tool definition hasn't been tampered with.
3.  **Sandboxing:** Running risky operations (like Python REPLs) in isolated containers.

Let's build it using Python.

## Layer 1: The Explicit Allowlist

The first line of defense is dumb but effective. Never let an LLM decide *if* it can run a tool; only let it decide *which* of the allowed tools it wants to run. 

We define a registry that maps tool names to actual functions, but we wrap the execution logic to check against an active allowlist.

```python
from typing import Callable, Dict, Any

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Callable] = {}
        self._allowlist: set[str] = set()

    def register(self, name: str, func: Callable, allowed: bool = True):
        self._tools[name] = func
        if allowed:
            self._allowlist.add(name)

    def execute(self, tool_name: str, **kwargs) -> Any:
        if tool_name not in self._tools:
            raise ValueError(f"Tool {tool_name} not found.")
        
        if tool_name not in self._allowlist:
            raise PermissionError(f"Security Alert: Access to {tool_name} is denied.")
            
        print(f"[LOG] Executing safe tool: {tool_name}")
        return self._tools[tool_name](**kwargs)
```

## Layer 2: Signed Tool Manifests

When you scale, you might load tool definitions dynamically (e.g., from a JSON file or database). A sophisticated attack involves modifying these definitions to map a safe-sounding function name (like `get_weather`) to a dangerous function (like `os.system`).

To prevent this, we can sign our tool manifests using HMAC (Hash-Based Message Authentication Code). When the harness loads a tool, it verifies the signature matches the code.

```python
import hmac
import hashlib
import json

SECRET_KEY = b'super-secret-weekend-key'

def sign_manifest(manifest: dict) -> str:
    """Generates a signature for a tool definition."""
    serialized = json.dumps(manifest, sort_keys=True).encode()
    return hmac.new(SECRET_KEY, serialized, hashlib.sha256).hexdigest()

def verify_and_load(manifest: dict, signature: str):
    """Loads a tool only if the signature is valid."""
    expected_sig = sign_manifest(manifest)
    if hmac.compare_digest(expected_sig, signature):
        print(f"Manifest for {manifest['name']} verified.")
        return True
    else:
        raise SecurityError(f"Tampering detected for {manifest['name']}!")

# Example Usage
tool_def = {"name": "query_sql", "description": "Run a SELECT query"}
sig = sign_manifest(tool_def)

# Later, in your app flow:
verify_and_load(tool_def, sig)
```

## Layer 3: The Sandbox (Docker)

Some tools are inherently risky. If your agent needs to write Python code to analyze data or execute Bash scripts, you cannot run this on your host machine. You need a sandbox.

For this project, we will use the Python `docker` SDK to spin up an ephemeral container for these specific tasks. This ensures that even if the LLM tries to delete the file system, it only destroys a temporary container.

First, install the SDK:

```bash
pip install docker
```

Now, let's create a `SandboxedExecutor`:

```python
import docker

class SandboxedExecutor:
    def __init__(self):
        self.client = docker.from_env()

    def run_python_unsafe(self, code: str):
        """
        Runs arbitrary Python code inside an isolated Alpine container.
        """
        print("[SANDBOX] Spinning up container...")
        try:
            # Run the code and destroy the container immediately after (auto_remove=True)
            result = self.client.containers.run(
                "python:3.9-alpine",
                command=["python", "-c", code],
                mem_limit="128m", # Limit resources
                network_disabled=True, # No internet access for the sandbox
                auto_remove=True
            )
            return result.decode('utf-8')
        except Exception as e:
            return f"Sandbox Error: {str(e)}"

# Usage
sandbox = SandboxedExecutor()
# Even if the LLM generates malicious code:
safe_output = sandbox.run_python_unsafe("import os; print(os.listdir('/'))")
print(safe_output)
```

## Bringing It All Together

Your final harness acts as the gateway. When the LLM returns a tool call:

1.  **Verify Integrity:** Check the HMAC of the tool definition to ensure it hasn't been swapped.
2.  **Check Permissions:** Look up the tool name in the `ToolRegistry` allowlist.
3.  **Route Execution:** If the tool is tagged as `requires_sandbox`, route it to the Docker executor. Otherwise, run it locally.

### Why this matters

Building agents is easy; securing them is hard. By implementing this harness, you move security out of the "prompt engineering" layer (which is fragile) and into the infrastructure layer (which is robust). You can now deploy agents that can write code or access APIs with the confidence that they won't accidentally brick your production environment.
