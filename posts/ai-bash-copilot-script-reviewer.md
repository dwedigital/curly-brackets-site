---
title: "AI as a Bash-Friendly Copilot: Building a Local ‘Script Reviewer’ for Your Automation Tasks"
date: "2026-01-10"
tags: ['Python','CLI','AI']

---
AI coding assistants are everywhere, but they often live inside heavy IDEs or browser tabs. For DevOps engineers and developers who live in the terminal, context-switching to a web UI just to sanity-check a 20-line Bash script breaks flow. 

What if you could pipe your script into an AI reviewer directly from the command line? 

In this guide, we’ll build a lightweight, Unix-philosophy-compliant CLI tool using Python. It will read your automation scripts, send them to an LLM (like GPT-4 or a local Llama 3 model), and print actionable safety checks and improvements right to your terminal.

## The Goal: A CLI for Code Hygiene

We want a tool that works like this:

```bash
$ review-script ./deploy.sh
```

And returns a formatted analysis focusing on:
1.  **Safety:** Are there dangerous commands (e.g., `rm -rf`) running on unchecked variables?
2.  **Idempotency:** Will this script break if I run it twice?
3.  **Modern Syntax:** Are we using deprecated flags?

## Prerequisites

We will use Python for the logic because of its robust library ecosystem. You’ll need:

*   Python 3.10+
*   An OpenAI API Key **OR** a local Ollama instance.
*   Two libraries: `openai` (for the API connection) and `rich` (for beautiful Markdown output in the terminal).

```bash
pip install openai rich
```

## Step 1: The Code

Create a file named `reviewer.py`. We will use `argparse` to handle CLI arguments and the OpenAI client to talk to the model.

Note: We are using the `rich` library to render the AI's response as formatted Markdown, making it easy to read in the console.

```python
#!/usr/bin/env python3
import os
import argparse
from openai import OpenAI
from rich.console import Console
from rich.markdown import Markdown

# Initialize Rich Console
console = Console()

def analyze_script(file_path, api_key=None, local_url=None):
    # Read the target script
    try:
        with open(file_path, 'r') as f:
            script_content = f.read()
    except FileNotFoundError:
        console.print(f"[bold red]Error:[/bold red] File {file_path} not found.")
        return

    # Setup the Client
    # If local_url is provided, we assume an Ollama/LocalAI setup
    if local_url:
        client = OpenAI(base_url=local_url, api_key="ollama")
        model = "llama3" # Or your preferred local model
    else:
        client = OpenAI(api_key=api_key)
        model = "gpt-4o"

    # The System Prompt
    system_prompt = (
        "You are a senior DevOps engineer and security expert. "
        "Review the provided script for security risks, idempotency issues, "
        "and error handling. Provide code snippets for fixes. "
        "Keep your response concise and formatted in Markdown."
    )

    with console.status("[bold green]Analyzing script...[/bold green]", spinner="dots"):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Script to review:\n\n{script_content}"}
                ]
            )
            content = response.choices[0].message.content
        except Exception as e:
            console.print(f"[bold red]API Error:[/bold red] {e}")
            return

    # Render Output
    console.print(Markdown(content))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Script Reviewer CLI")
    parser.add_argument("file", help="Path to the script file to review")
    parser.add_argument("--local", help="Use local Ollama endpoint (e.g., http://localhost:11434/v1)", default=None)
    
    args = parser.parse_args()
    
    # Grab API key from env if not using local
    api_key = os.getenv("OPENAI_API_KEY")
    if not args.local and not api_key:
        console.print("[bold red]Error:[/bold red] Please set OPENAI_API_KEY or use --local")
    else:
        analyze_script(args.file, api_key, args.local)
```

## Step 2: Making it Executable

To make this feel like a native command, we need to make the script executable and add it to our path.

1.  **Make it executable:**
    ```bash
    chmod +x reviewer.py
    ```

2.  **Alias it (Optional):**
    Add this to your `.bashrc` or `.zshrc`:
    ```bash
    alias review="python3 /path/to/your/reviewer.py"
    ```

## Step 3: Usage

Now, let's say you have a risky cleanup script called `cleanup.sh`:

```bash
#!/bin/bash
folder=$1
rm -rf $folder/
```

Run your reviewer against it:

```bash
review cleanup.sh
```

The AI will likely flag that if `$1` is empty, this script resolves to `rm -rf /`, which is catastrophic. It will suggest checking if the variable is set before running the delete command.

## Going Local with Ollama

If you are working on proprietary code and don't want to send snippets to OpenAI, this script supports local inference out of the box.

1.  Install [Ollama](https://ollama.com).
2.  Pull a coding model: `ollama pull llama3`.
3.  Run the reviewer with the local flag:

```bash
review cleanup.sh --local "http://localhost:11434/v1"
```

## Conclusion

By wrapping an LLM in a simple CLI, you've moved the intelligence from the browser into your actual workflow. You can now sanity-check code without leaving your terminal, ensuring your automation scripts are robust before you ever hit `Enter`.
