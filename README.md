# SWRX 
**A library for frontend SPAs using HTMX for a more civilized age**

SWRX is a lightweight service worker router designed to handle HTTP requests in a service worker context using an Express-like syntax. It is designed to be paired with HTMX to enhance the interactivity of web applications, but it can also be used independently. SWRX allows developers to define routes and handle requests directly within the service worker, providing a seamless way to manage offline capabilities and enhance web application performance.

## Features

- **Express-like Routing**: Define routes using familiar HTTP methods such as GET, POST, PUT, DELETE, etc.
- **URL Parameter Parsing**: Easily extract parameters from URLs using a simple syntax.
- **HTML Response Generation**: Create HTML responses directly within the service worker.
- **Service Worker Integration**: Leverage the power of service workers to intercept and handle network requests.
- **Fallback to normal HTTP**: Routes that aren't handled by the router, just pass through to normal server HTTP calls

## What are Service Workers?

Service workers are scripts that run in the background of your web application, separate from the main browser thread. They enable features such as offline support, background sync, and push notifications. SWRX leverages service workers to intercept and handle network requests, providing a seamless way to manage offline capabilities and enhance web application performance.

When using SWRX, you can specify how to handle the situation when a new service worker is detected by the browser. You have three options:
1. **Do nothing**: The new service worker will start handling requests as soon as it's loaded.
2. **Reload the screen**: Automatically refresh the page to ensure the latest service worker is in control.
3. **Redirect the location**: Redirect the user to a different page, such as the index, when a new service worker is activated.

## Getting Started

To use SWRX, include the `swrx.js` script in your service worker file and define your routes using the provided helper functions.

### Example

Here's a simple example demonstrating how to define routes using SWRX:

```javascript
import "./swrx.js";

// Define a GET route
get("/pages/index", (request) => {
  return new Response("Hello world!", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
});

// Define a POST route with URL parameters
post("/submit/[id]/[otherid]/*", async (request) => {
  const { id, otherid, wildcard } = request.params;
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");

  if (!name || !email) {
    return html`
      <html>
        <head>
          <title>Error</title>
        </head>
        <body>
          <h1>Error</h1>
          <p>Missing form fields. Both "name" and "email" are required.</p>
        </body>
      </html>
    `;
  }

  return html`
    <html>
      <head>
        <title>Form Submitted</title>
      </head>
      <body>
        <h1>Form Submitted Successfully!</h1>
        <p>ID: ${id}</p>
        <p>Other ID: ${otherid}</p>
        <p>Wildcard: ${wildcard}</p>
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
      </body>
    </html>
  `;
});
```

## HTMX Integration

SWRX can be seamlessly integrated with HTMX to enhance the interactivity of your web applications. HTMX allows you to use HTML attributes to perform AJAX requests, update parts of the page, and handle user interactions without writing JavaScript.

### HTMX Example

Here's an example of how you can use HTMX with SWRX to handle form submissions:

```html
<form hx-post="/user/richard" hx-target="#response" hx-swap="innerHTML">
  <div>
    <label for="name">Name:</label>
    <input type="text" name="name" id="name" required />
  </div>
  <div>
    <label for="email">Email:</label>
    <input type="email" name="email" id="email" required />
  </div>
  <button type="submit">Submit</button>
</form>
```

In this example, the form uses `hx-post` to send a POST request to the server when submitted. The response is then injected into the `#response` element using `hx-target` and `hx-swap`.

### Service Worker Handler Example

Here's how you can define a service worker handler for the above HTMX form submission using SWRX:

```javascript
post("/user/[userId]", async (request) => {
  const { userId } = request.params;
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");

  if (!name || !email) {
    return html`
      <html>
        <head>
          <title>Error</title>
        </head>
        <body>
          <h1>Error</h1>
          <p>Missing form fields. Both "name" and "email" are required.</p>
        </body>
      </html>
    `;
  }

  return html`
    <html>
      <head>
        <title>Form Submitted</title>
      </head>
      <body>
        <h1>Form Submitted Successfully!</h1>
        <p>Username: ${userId}</p>
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
      </body>
    </html>
  `;
});
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
