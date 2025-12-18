---
title: "Querying JSON and XML with jq and xq"
date: "2025-12-18"
tags: ['DevOps','CLI','Data Engineering']

---
As developers, we constantly wrangle structured data. Whether it's debugging a JSON API response or digging through an XML configuration file, reading raw text output in the terminal can be a nightmare. 

Enter **jq** and **xq**. These command-line processors function like `sed` or `awk`, but specifically for structured data formats. They allow you to slice, filter, map, and transform data with ease.

## Meet jq: The JSON Processor

`jq` is a lightweight and flexible command-line JSON processor. It is the industry standard for parsing JSON in bash scripts.

### Basic Access

The simplest `jq` program is the identity filter `.`, which takes the input and pretty-prints it. To access a specific property, you use the dot notation.

```bash
# echo '{"name": "Alice", "role": "admin"}' | jq '.name'
"Alice"
```

### Working with Arrays

If your data is inside an array, you can iterate over it using `[]`. For example, let's say we have a list of users:

```json
[
  {"id": 1, "user": "Alice"},
  {"id": 2, "user": "Bob"}
]
```

To get just the usernames:

```bash
cat users.json | jq '.[].user'
```

**Output:**
```text
"Alice"
"Bob"
```

## Meet xq: jq for XML

While JSON is popular, XML is still prevalent in enterprise configurations and older APIs. `xq` (often part of the python `yq` package) creates a seamless bridge by converting XML to JSON on the fly and piping it to `jq`.

This means **if you know jq, you already know xq**.

_Note: You can install the Python version via `pip install yq`._

Given this XML:

```xml
<server>
  <host name="production" ip="10.0.0.1" />
  <host name="staging" ip="10.0.0.2" />
</server>
```

You can query the production IP just like it was JSON:

```bash
cat config.xml | xq '.server.host[] | select(.name == "production") | .ip'
```

## Essential Operators and Functions

Since `xq` translates XML to JSON, these operators apply to both tools.

### The Pipe Operator `|`

Just like in Unix, the pipe passes the output of one filter to the input of the next. It is crucial for chaining logic.

### Filtering with `select()`

`select(boolean_expression)` allows you to filter arrays based on specific criteria. 

**Example:** Get all items with a price greater than 50.

```bash
cat items.json | jq '.[] | select(.price > 50)'
```

### Data Transformation (Mapping)

You can construct entirely new JSON objects on the fly. This is useful when you want to reshape an API response before passing it to another tool.

```bash
# Convert a complex object into a simplified one
cat data.json | jq '{ id: .system_id, label: .meta.display_name }'
```

## Real-Life Examples

### 1. Extracting Dependencies from package.json

If you want to list all production dependencies in a Node.js project:

```bash
jq '.dependencies | keys[]' package.json
```

### 2. Finding Errors in XML Logs

Imagine an XML log file where events have attributes. You can quickly find all events marked as 'Error'.

```bash
# <log><event type="Info">Start</event><event type="Error">Crash</event></log>

cat app.log | xq '.log.event[] | select(."@type" == "Error")'
```

_(Note: `xq` often prefixes XML attributes with `@` to distinguish them from text content)_

## Conclusion

Mastering `jq` and `xq` turns the command line into a powerful IDE for data. Instead of manually scrolling through thousands of lines of logs or responses, you can write simple queries to extract exactly what you need.
