---
title: "Mastering Your Life with CLI Search Tools and Markdown"
date: "2026-01-11"
tags: ['CLI', 'Bash', 'Tutorial']

---
In an era of bloated productivity apps, subscription-based note-taking services, and proprietary databases, there is a quiet revolution happening among developers: the return to plain text. By maintaining your life's administrative data—todos, bookmarks, project notes—in simple Markdown files, you unlock the full power of the Unix command line.

This approach, often called "Personal Knowledge Management" (PKM) via CLI, relies on three heavy hitters: **grep**, **ripgrep**, and **awk**. Let's explore how to turn a folder of text files into a powerful, searchable database.

## The Philosophy: Text is Universal

The premise is simple: store everything in a folder (e.g., `~/notes`) using Markdown. 

*   **Daily logs:** `2023-10-27.md`
*   **Project specs:** `project-alpha.md`
*   **Cheat sheets:** `docker-commands.md`

Once your data is text, you don't need a search bar; you need a regex.

## Tool 1: Ripgrep (rg) for Speed

While `grep` is ubiquitous, [Ripgrep (rg)](https://github.com/BurntSushi/ripgrep) is the modern champion of speed. It respects `.gitignore` files automatically and is optimized for searching code and text.

### Use Case: The Global TODO List

Instead of checking five different project management tools, sprinkle your tasks directly into your notes using a standard format like `TODO` or the Markdown checkbox `- [ ]`.

To view every incomplete task across your entire life:

```bash
# Find lines containing '- [ ]' in the ~/notes directory
rg "\- \[ \]" ~/notes
```

You can create an alias in your `.zshrc` or `.bashrc` to make this a dashboard command:

```bash
alias todos='rg "TODO|\- \[ \]" ~/notes --glob "*.md"'
```

Now, typing `todos` gives you an instant, aggregate view of your workload.

## Tool 2: Grep for Availability

If you find yourself on a server where you can't install `ripgrep`, standard `grep` is your best friend. 

### Use Case: Finding Tags

You might tag your notes using hashtags like `#bookmark` or `#ideas`. To find all bookmarks recursively:

```bash
grep -r "#bookmark" ~/notes
```

To make it cleaner, you can suppress line numbers and filenames if you just want the content, or use color to highlight matches:

```bash
grep -r --color=always "#bookmark" ~/notes
```

## Tool 3: Awk for Reporting

Searching finds the data; **Awk** formats it. Awk is a pattern scanning and processing language that excels at manipulating text columns. 

### Use Case: Building a Bookmarks Report

Imagine you save links in your notes like this: `[Link Title](http://url.com) #bookmark`.

You want a clean list of just the URLs to pipe into a browser or a list. We can pipe the search result from `rg` into `awk`.

```bash
# 1. Search for #bookmark
# 2. Use awk to find the substring between parentheses (the URL)

rg "#bookmark" ~/notes | awk -F '](|)' '{print $2}'
```

Or, let's say you want to summarize how many TODOs you have per file to see which project is dragging behind:

```bash
rg -c "TODO" ~/notes | awk -F: '{print $2 " pending tasks in " $1}'
```

*   `rg -c`: Counts matches per file.
*   `awk -F:`: Splits the output by the colon separator.
*   `print`: Reorders the output into a readable sentence.

## Putting It All Together: The `brain` Script

You can combine these tools into a simple bash function. Add this to your shell configuration to search your notes instantly:

```bash
function brain() {
    if [ -z "$1" ]; then
        echo "Usage: brain [search_term]"
        return 1
    fi
    
    echo "Searching notes for: $1..."
    echo "--------------------------"
    # Search case-insensitive (-i) and nicely formatted
    rg -i --heading --line-number "$1" ~/notes
}
```

## Conclusion

You don't need complex software to organize your life. By combining the portability of Markdown with the raw power of CLI tools, you build a system that is fast, future-proof, and entirely yours.
