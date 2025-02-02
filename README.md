

<p align="center">
  <img src="https://github.com/user-attachments/assets/1834ae44-2f86-4488-a706-b54cd40b942c" width="300"/>
</p>


# SWRX
**A library for frontend SPAs using HTMX for a more civilized age using Service Workers**

SWRX is a lightweight service worker router designed to handle HTTP requests in a service worker context using an Express-like syntax. It is designed to be paired with HTMX to enhance the interactivity of web applications, but it can also be used independently. SWRX allows developers to define routes and handle requests directly within the service worker, providing a seamless way to manage offline capabilities and enhance web application performance.

## Features

- **Express-like Routing**: Define routes using familiar HTTP methods such as GET, POST, PUT, DELETE, etc.
- **URL Parameter Parsing**: Easily extract parameters from URLs using a simple syntax.
- **HTML Response Generation**: Create HTML responses directly within the service worker.
- **Service Worker Integration**: Leverage the power of service workers to intercept and handle network requests.
- **Simple Key-Value Storage**: Provides a simple key-value storage similar to localStorage for persisting data using IndexDB
- **Fallback to normal HTTP**: Routes that aren't handled by the router, just pass through to normal server HTTP calls

## What are Service Workers?

Service workers are scripts that run in the background of your web application, separate from the main browser thread. They enable features such as offline support, background sync, and push notifications. SWRX leverages service workers to intercept and handle network requests, providing a seamless way to manage offline capabilities and enhance web application performance.

## Getting Started

To use SWRX, include the `swrx.js` script in your service worker file and define your routes using the provided helper functions.

[Minimal quick start using HTMX + SWRX + Tailwind + Typescript](https://github.com/richardanaya/htmx-swrx-tailwind-typescript)

If you're unfamiliar with how service workers load and get updated, you might want to look at the index.html file in this project :point-up:

### Example

Here's a simple example demonstrating how to define routes using SWRX:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Htmx Service Worker Router</title>
    <!-- Include HTMX 2.0 from a CDN -->
    <script src="https://unpkg.com/htmx.org@2.0.0/dist/htmx.js"></script>
    <script src="https://unpkg.com/@richardanaya/swrx@0.0.13/swrx.js"></script>
  </head>
  <body>
   <h1>Submit Your Information</h1>
    <form
      hx-post="/submit/123/abc/wildcard info can go here"
      hx-target="#response"
      hx-swap="innerHTML"
    >
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

    <!-- The response from the server will be injected into this element -->
    <div id="response" style="margin-top: 20px"></div>
    <script>
      loadHtmxRouter("/sw.js");
    </script>
  </body>
</html>
```


```javascript
import "https://unpkg.com/@richardanaya/swrx@0.0.13/swrx.js";

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
    `.setStatus(400).buildResponse();
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
  `.buildResponse();
});
```

## Simple Key-Value Storage Example

SWRX provides a simple key-value storage mechanism similar to localStorage. Here's an example of how you can use it to maintain a counter:

```javascript
// Increment a counter stored in the service worker's storage
post("/increment-counter", async (request) => {
  let counter = await serviceStorage.getItem("counter");
  if (!counter) {
    counter = 0;
  }
  counter++;
  await serviceStorage.setItem("counter", counter);

  return html`Counter is now: ${counter}`.buildResponse();
});
```

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
