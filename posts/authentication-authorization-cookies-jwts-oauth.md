---
title: 'Authentication and Authorization Explained: Cookies, JWTs, Sessions, and OAuth in Practice'
date: '2025-12-12'
tags: ['Web Development','Security','Backend']

---
As a junior developer, few topics are as daunting—or as critical—as security. You implement a login form, but what happens next? How does the server remember the user? How do you prevent them from accessing admin pages?

This guide breaks down the core concepts of Authentication (AuthN) and Authorization (AuthZ) and explores the most common strategies used in modern web development.

## The Core Difference: Who vs. What

Before diving into code, we must distinguish between the two "Auths."

*   **Authentication (AuthN):** Verifying **who** you are. (e.g., logging in with a username and password).
*   **Authorization (AuthZ):** Verifying **what** you are allowed to do. (e.g., an admin has permission to delete users, but a standard user does not).

**The Real-world Analogy:**
*   Showing your ID card to a security guard is **Authentication**.
*   Using your key card to open the door to the server room (while being denied entry to the CEO's office) is **Authorization**.

## 1. Traditional Cookie-Based Sessions

For decades, this was the standard way to handle logins. It is stateful, meaning the server keeps track of who is logged in.

**The Flow:**
1.  User sends credentials.
2.  Server verifies them and creates a `session_id` stored in a database or memory.
3.  Server sends this `session_id` back to the browser as a **Cookie**.
4.  On every subsequent request, the browser automatically sends the cookie.
5.  Server checks the cookie ID against its records.

**Pros:** Simple, easy to revoke (just delete the session on the server).
**Cons:** Harder to scale horizontally (need a shared session store like Redis).

```python
# Flask (Python) Example
from flask import session

@app.route('/login', methods=['POST'])
def login():
    # ... verify password ...
    session['user_id'] = user.id  # Server creates a signed cookie
    return "Logged in!"
```

## 2. JSON Web Tokens (JWTs)

JWTs are the modern standard for **stateless** authentication. Unlike sessions, the server doesn't keep a record of the token. Instead, the token *is* the record.

**The Flow:**
1.  User sends credentials.
2.  Server verifies them and signs a JSON object (payload) with a secret private key.
3.  Server sends the token to the client.
4.  Client sends the token in the HTTP Authorization header (`Authorization: Bearer <token>`).
5.  Server validates the signature mathematically.

**Structure of a JWT:**
It looks like `xxxxx.yyyyy.zzzzz` (Header.Payload.Signature).

```javascript
// The payload usually looks like this:
{
  "sub": "1234567890",
  "name": "John Doe",
  "role": "admin",
  "iat": 1516239022
}
```

> **⚠️ Critical Security Tip:** JWT payloads are Base64 encoded, not encrypted. Anyone can read them. **Never** put passwords or sensitive personal data inside a JWT.

## 3. Where to Store Tokens: The Great Debate

When using JWTs, where do you save them on the frontend?

### Option A: LocalStorage
*   **Pros:** Easy to use (`localStorage.setItem('token', jwt)`).
*   **Cons:** Vulnerable to **XSS** (Cross-Site Scripting). If malicious JS runs on your page, it can steal the token.

### Option B: HttpOnly Cookies
*   **Pros:** Immune to XSS. JavaScript cannot read these cookies.
*   **Cons:** Vulnerable to **CSRF** (Cross-Site Request Forgery), though modern frameworks have built-in protections.

**Recommendation:** For web apps, **HttpOnly Cookies** are generally considered the safer bet.

## 4. Refresh Tokens vs. Access Tokens

If a JWT is stolen, the attacker has access forever (or until expiration). To mitigate this, we use short lifetimes.

1.  **Access Token:** Short life (e.g., 15 mins). Used to fetch data.
2.  **Refresh Token:** Long life (e.g., 7 days). Stored securely (HttpOnly cookie). Used only to get a *new* Access Token.

When the Access Token expires, the frontend quietly asks the auth server: "Here is my Refresh Token, give me a new Access Token."

## 5. OAuth 2.0 (The "Login with Google" approach)

OAuth is not an authentication protocol strictly speaking; it is a framework for authorization, though we often use it to log in.

Instead of giving an app your Facebook password, you tell Facebook to give the app a **token**. That token allows the app to do specific things (like read your email address) without ever knowing your credentials.

**The Flow:**
1.  User clicks "Login with Google."
2.  User is redirected to Google.
3.  User signs in to Google and consents.
4.  Google redirects back to your app with an Authorization Code.
5.  Your backend swaps that code for an Access Token.

## Summary Checklist for Junior Devs

*   **Use Libraries:** Never write your own crypto or sign your own tokens from scratch. Use established libraries (like `jsonwebtoken` in Node or `PyJWT` in Python).
*   **HTTPS Always:** Auth tokens are useless if sent over HTTP; they can be intercepted easily.
*   **Validate Everything:** Just because a token says `role: admin` doesn't mean you shouldn't double-check database permissions for critical actions.

Security is a journey, not a destination. Start with these fundamentals, and you'll be building safer apps in no time.
