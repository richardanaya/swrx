import "https://unpkg.com/@richardanaya/swrx/swrx.js";

// Define your routes using an Express-like syntax.
// Example: A GET route for '/foo' that returns "Hello world!".
get("/pages/index", (request) => {
  return new Response("Goodbye world!", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
});

post("/submit/[id]/[otherid]/*", async (request) => {
  let counter = await serviceStorage.getItem("counter");
  if (!counter) {
    await serviceStorage.setItem("counter", 1);
    counter = 2;
  }
  await serviceStorage.setItem("counter", counter + 1);
  const { id, otherid, wildcard } = request.params;
  try {
    // Parse the form data from the request.
    const formData = await request.formData();

    // Retrieve fields from the form data.
    const name = formData.get("name");
    const email = formData.get("email");

    // Validate that both fields are provided.
    if (!name || !email) {
      const response = html`
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
      response.status = 400;
      return response;
    }

    // Create an HTML response displaying the submitted data.
    return html`
      <html>
        <head>
          <title>Form Submitted</title>
        </head>
        <body>
          <h1>Form Submitted Successfully!</h1>
          ${id} ${otherid} ${wildcard}
          <p>Name: ${name}</p>
          <p>Email: ${email}</p>
          <p>Counter: ${counter}</p>
        </body>
      </html>
    `;
  } catch (error) {
    const response = html`
      <html>
        <head>
          <title>Error</title>
        </head>
        <body>
          <h1>Error Processing Form Data</h1>
          <p>${error.toString()}</p>
        </body>
      </html>
    `;
    response.status = 500;
  }
});
