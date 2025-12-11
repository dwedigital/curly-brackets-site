---
title: 'Build a Simple API with Node.js and Express: A Starter Guide'
date: '2025-12-11'
tags: ['Node.js','Express','API']

---
If you are starting your journey into backend development, Node.js paired with Express is one of the best combinations to learn. Node.js allows you to run JavaScript outside of the browser, and Express is a minimal framework that makes building web servers and APIs significantly easier.

In this guide, we will walk through creating a minimal HTTP API that can handle JSON data, manage routes, and utilize middleware.

## Prerequisites

Before we begin, ensure you have the following installed:
*   **Node.js**: You can download it from [nodejs.org](https://nodejs.org/).
*   **A Code Editor**: VS Code is highly recommended.
*   **Terminal/Command Prompt**: To run commands.

## Step 1: Setting Up the Project

First, create a folder for your project and navigate into it using your terminal. We need to initialize a `package.json` file, which tracks our dependencies.

```bash
mkdir my-express-api
cd my-express-api
npm init -y
```

Next, install Express:

```bash
npm install express
```

## Step 2: Creating the Server

Create a file named `index.js` in your project folder. This will be the entry point of your application. We will start by importing Express and setting up a server to listen on a specific port.

```javascript
const express = require('express');
const app = express();
const PORT = 3000;

// Basic Route
app.get('/', (req, res) => {
  res.send('Welcome to my API!');
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

You can run this server by typing `node index.js` in your terminal. If you visit `http://localhost:3000` in your browser, you should see the welcome message.

## Step 3: Handling JSON and Middleware

Modern APIs communicate primarily using JSON. To make Express understand incoming JSON data in requests (like POST requests), we need to use built-in middleware.

Add the following line near the top of your `index.js` file, right after defining `app`:

```javascript
app.use(express.json());
```

Middleware in Express represents functions that run during the request-response cycle. `express.json()` parses incoming requests with JSON payloads and puts the parsed data in `req.body`.

## Step 4: Building API Routes

Let's create a mock database using an array and build two routes: one to get data (GET) and one to add data (POST).

```javascript
// Mock Data
const users = [
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'User' }
];

// GET: Retrieve all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// POST: Create a new user
app.post('/api/users', (req, res) => {
  const newUser = req.body;
  
  // Simple validation
  if (!newUser.name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  // Simulate auto-incrementing ID
  newUser.id = users.length + 1;
  users.push(newUser);

  res.status(201).json(newUser);
});
```

### Explanation:
1.  **GET `/api/users`**: Responds with the `users` array in JSON format.
2.  **POST `/api/users`**: Takes the data sent by the client (`req.body`), assigns an ID, adds it to the list, and returns the created object with a `201 Created` status code.

## Step 5: Testing Your API

Since browsers generally only perform GET requests via the address bar, you need a tool to test POST requests. You can use:
*   **Postman** (Desktop application)
*   **cURL** (Command line)
*   **VS Code Extensions** (like Thunder Client)

To test the POST route using cURL, run this in a separate terminal window while your server is running:

```bash
curl -X POST http://localhost:3000/api/users \
   -H "Content-Type: application/json" \
   -d '{"name": "Charlie", "role": "Guest"}'
```

If successful, the API will return the new user object with an ID.

## Conclusion

You have just built a functional REST API foundation! You learned how to initialize a Node.js project, install Express, handle JSON data using middleware, and create routes to read and write data. From here, you can expand by connecting a real database like MongoDB or PostgreSQL and adding authentication.
