---
title: 'HTTP 101 for Web Developers: Methods, status codes, and headers you need to know'
date: '2025-12-12'
tags: ['HTTP','Web Development','Backend']

---
If you build for the web, you are building on top of HTTP. Whether you are a frontend developer fetching data with React or a backend developer building REST APIs in Python, understanding the Hypertext Transfer Protocol (HTTP) is non-negotiable.

At its core, HTTP is a simple request-response protocol. It represents a conversation between a **Client** (your browser or mobile app) and a **Server** (the computer holding the data).

In this guide, we will break down the mechanics of this conversation, exploring the verbs, the numbers, and the metadata that power the internet.

## The Flow: Request and Response

Every interaction starts with a **Request** from the client. A request contains:
1.  **URL**: Where we are going (e.g., `https://api.example.com/users`).
2.  **Method**: What we want to do.
3.  **Headers**: Meta-information about the request.
4.  **Body** (Optional): Data we are sending to the server.

The server processes this and sends back a **Response**, which contains:
1.  **Status Code**: Did it work?
2.  **Headers**: Meta-information about the response.
3.  **Body**: The data requested (usually HTML or JSON).

## HTTP Methods: The Verbs

Methods tell the server *what action* you want to perform on a resource. While there are many, these five make up 99% of your daily work:

### 1. GET
Used to **retrieve** data. It should have no side effects (it doesn't change the database). 
*   *Example:* Loading a webpage or fetching a user profile.

### 2. POST
Used to **create** new data. The data is usually sent in the request body.
*   *Example:* Submitting a signup form.

### 3. PUT
Used to **replace** an existing resource entirely. If you only send half the fields, the other half might be wiped out (depending on implementation).
*   *Example:* Overwriting an entire configuration file.

### 4. PATCH
Used to **update** parts of an existing resource. 
*   *Example:* Changing just a user's email address without touching their name or password.

### 5. DELETE
Used to **remove** data.
*   *Example:* Deleting a comment.

## Status Codes: The Scoreboard

When the server responds, it shouts out a three-digit number to let you know how things went. You don't need to memorize them all, but you must know the categories:

*   **2xx (Success):** Everything is great.
    *   **200 OK:** Standard success.
    *   **201 Created:** Success, and a new resource was created (common after a POST).
*   **3xx (Redirection):** Go somewhere else.
    *   **301 Moved Permanently:** The old URL is gone, update your bookmarks.
    *   **304 Not Modified:** You have the cached version already, so we won't send the data again.
*   **4xx (Client Error):** You (the developer) messed up.
    *   **400 Bad Request:** Your syntax is wrong.
    *   **401 Unauthorized:** You need to log in.
    *   **403 Forbidden:** You are logged in, but you aren't allowed to touch this.
    *   **404 Not Found:** The resource doesn't exist.
*   **5xx (Server Error):** The server messed up.
    *   **500 Internal Server Error:** Something exploded in the backend code.
    *   **502 Bad Gateway:** One server received an invalid response from another upstream server.

## Headers: The Metadata

Headers are key-value pairs sent in both requests and responses. They provide context.

**Common Request Headers:**
*   `Authorization`: Credentials (like a Bearer token) to prove who you are.
*   `Content-Type`: Tells the server what format your body is (e.g., `application/json`).
*   `User-Agent`: Identifies the client software (e.g., Chrome, Firefox, or a script).

**Common Response Headers:**
*   `Content-Type`: Tells the client how to parse the response.
*   `Cache-Control`: Instructions on how long to keep the data in memory.

## Practical Demo with cURL

We can see all of this in action using `curl`, a command-line tool found in most terminals. We will use [JSONPlaceholder](https://jsonplaceholder.typicode.com/), a free fake API for testing.

### 1. The GET Request
Let's fetch a To-Do item. Run this in your terminal:

```bash
curl -v https://jsonplaceholder.typicode.com/todos/1
```

The `-v` flag stands for "verbose," showing the handshake. You will see lines starting with `>` (Request) and `<` (Response).

**Look for:**
*   `> GET /todos/1 HTTP/2`
*   `< HTTP/2 200`
*   The JSON body at the end.

### 2. The POST Request
Now, let's try to create a new post. We need to set the method to POST, set the header to JSON, and provide the data body.

```bash
curl -X POST https://jsonplaceholder.typicode.com/posts \n  -H "Content-Type: application/json" \n  -d '{"title": "My New Post", "body": "Learning HTTP is fun", "userId": 1}'
```

**Response:**
```json
{
  "title": "My New Post",
  "body": "Learning HTTP is fun",
  "userId": 1,
  "id": 101
}
```

Notice the API returned an `id` of `101`, simulating that the record was created.

## Summary

Understanding HTTP removes the "magic" from web development. When your frontend breaks, check the network tab. Is it a **404**? You have the wrong URL. Is it a **500**? The backend is down. Is it a **401**? Check your authorization header.

Master these basics, and debugging becomes significantly easier.
