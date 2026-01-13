---
title: "From Bash to Go: Replacing Shell Automation with Safer, Faster Go Scripts"
date: "2025-12-17"
tags: ['Go', 'Bash', 'DevOps', 'Automation', 'Tutorial']

---
We have all been there. What starts as a simple three-line Bash script to back up a database eventually grows into a 500-line monstrosity. It has brittle variable expansion, inconsistent error handling, and relies on a specific version of `sed` that is only installed on one legacy server.

While Bash is the lingua franca of Linux systems, it lacks the safety guarantees, testing infrastructure, and maintainability required for complex automation. In this post, we will explore a pragmatic path for transitioning your critical infrastructure scripts from shell to Go.

## The Problem with "Shelling Out"

Bash is excellent for gluing commands together, but it struggles with logic. The moment you introduce arrays, complex conditionals, or JSON parsing, you enter a minefield of potential bugs.

Consider this classic error:

```bash
#!/bin/bash
TARGET_DIR=$1
rm -rf $TARGET_DIR/
```

If the user forgets to supply an argument, `$TARGET_DIR` is empty, and the script attempts to run `rm -rf /`. While modern shells have safeguards, this illustrates the "stringly typed" danger of shell scripting.

## Why Go for Automation?

Python has traditionally been the next step up from Bash, but Go offers specific advantages for DevOps scenarios:

1.  **Single Binary Distribution**: You can compile your tool on your machine and `scp` a single binary to the server. No need to worry about Python venv, missing pip modules, or Ruby gem versions.
2.  **Type Safety**: The compiler catches typoed variable names and type mismatches before the code ever runs in production.
3.  **Concurrency**: Go's lightweight goroutines make parallelizing tasks (like processing logs or pinging servers) trivial compared to `&` background jobs in Bash.

## Mini Case Study: The Migration

Let's look at a typical scenario: A script that cleans up old log files. 

### The Bash Version

```bash
#!/bin/bash
set -e

LOG_DIR="/var/log/myapp"
DAYS=7

# Find files older than 7 days and delete them
find "$LOG_DIR" -name "*.log" -type f -mtime +$DAYS -exec rm {} \;

echo "Cleanup complete."
```

This works, but it's fragile. It depends on `find` syntax remaining consistent, and testing this logic without actually deleting files is difficult.

### The Go Equivalent

In Go, we trade brevity for explicit safety and cross-platform compatibility.

```go
package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

func main() {
	logDir := flag.String("dir", "/var/log/myapp", "Directory to scan")
	days := flag.Int("days", 7, "Delete logs older than X days")
	flag.Parse()

	cutoff := time.Now().AddDate(0, 0, -*days)

	err := filepath.Walk(*logDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && filepath.Ext(path) == ".log" {
			if info.ModTime().Before(cutoff) {
				fmt.Printf("Deleting %s\n", path)
				// In a real run: os.Remove(path)
			}
		}
		return nil
	})

	if err != nil {
		fmt.Printf("Error walking the path: %v\n", err)
		os.Exit(1)
	}
}
```

While longer, the Go version provides:
*   **Command Line Flags**: Built-in help text (`-h`).
*   **Dry Run Capability**: Easy to wrap the `os.Remove` in a conditional check.
*   **Explicit Error Handling**: We know exactly where permissions might fail.

## Handling Subprocesses

Sometimes you still need to call system commands. Go's `os/exec` package is robust, allowing you to separate arguments cleanly preventing injection attacks.

```go
import "os/exec"

cmd := exec.Command("git", "commit", "-m", "Automated backup")
cmd.Stdout = os.Stdout
cmd.Stderr = os.Stderr

if err := cmd.Run(); err != nil {
    // Handle exit code != 0
}
```

## Concurrency: The Killer Feature

If you need to perform this cleanup on 50 different servers via API calls, Bash handles it sequentially. Go handles it concurrently with ease.

```go
var wg sync.WaitGroup
servers := []string{"srv1", "srv2", "srv3"}

for _, server := range servers {
    wg.Add(1)
    go func(s string) {
        defer wg.Done()
        cleanLogsOnServer(s) // your logic here
    }(server)
}
wg.Wait()
```

## Testing Strategies

One of the biggest arguments for switching to Go is **testing**. You can write unit tests for your automation logic just like application code.

```go
func TestCutoffLogic(t *testing.T) {
    // Create a temp file with an old timestamp
    // Run logic
    // Assert file is gone
}
```

## When to Rewrite?

Not every Bash script needs to be rewritten. Use this heuristic to decide:

1.  **Complexity**: If you are using arrays, regex parsing, or heavy logic—switch to Go.
2.  **Team Size**: If more than one person maintains the script, Go's readability and type safety are worth the investment.
3.  **Frequency**: If the script runs every minute, the performance gain of a compiled binary vs an interpreted shell script adds up.
4.  **Lines of Code**: As a rule of thumb, if a Bash script exceeds 100 lines, it's time to migrate.

## Conclusion

Bash will always have a place in our toolbelt for quick one-liners and piping commands. However, for automation that your infrastructure depends on, Go provides the safety, speed, and tooling necessary to sleep soundly at night. Start small—pick one flaky script, rewrite it, and enjoy the stability of a compiled language.
