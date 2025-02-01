if (
  typeof ServiceWorkerGlobalScope !== "undefined" &&
  self instanceof ServiceWorkerGlobalScope
) {
  self.addEventListener("install", (event) => {
    self.skipWaiting();
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
  });

  // -------------------- Minimal Express-like Router with URL Params --------------------

  // Array to store route definitions.
  const routes = [];

  /**
   * Converts a route path with parameters in square brackets into a regex.
   * For example, "/foo/[id]" becomes /^\/foo\/([^/]+)$/
   * and returns an object with the regex and the names of the parameters.
   *
   * @param {string} path - The route path pattern.
   * @returns {Object} An object with { regex: RegExp, keys: string[] }.
   */
  function parsePath(path) {
    const keys = [];

    // Replace parameters in square brackets with a capturing group.
    let regexString = path.replace(/\[([^\]]+)\]/g, (_, key) => {
      keys.push(key);
      return "([^/]+)";
    });

    // Replace wildcards with a capturing group.
    // This will capture any characters (including slashes) for the wildcard.
    regexString = regexString.replace(/\*/g, () => {
      keys.push("wildcard");
      return "(.*)";
    });

    return { regex: new RegExp(`^${regexString}$`), keys };
  }

  /**
   * Registers a route with the specified HTTP method, path, and handler.
   *
   * @param {string} method - The HTTP method (GET, POST, etc.).
   * @param {string} path - The URL path pattern to match.
   * @param {Function} handler - The function to handle the request.
   */
  function route(method, path, handler) {
    // Parse the path to generate a regex and extract parameter keys.
    const { regex, keys } = parsePath(path);
    routes.push({ method, path, handler, regex, keys });
  }

  // Helper functions for each HTTP verb.
  function get(path, handler) {
    route("GET", path, handler);
  }

  function post(path, handler) {
    route("POST", path, handler);
  }

  function put(path, handler) {
    route("PUT", path, handler);
  }

  function del(path, handler) {
    route("DELETE", path, handler);
  }

  function patch(path, handler) {
    route("PATCH", path, handler);
  }

  function options(path, handler) {
    route("OPTIONS", path, handler);
  }

  function head(path, handler) {
    route("HEAD", path, handler);
  }

  // Expose the helper functions to the global scope so they can be used in sw.js.
  self.get = get;
  self.post = post;
  self.put = put;
  self.del = del;
  self.patch = patch;
  self.options = options;
  self.head = head;

  function html(strings, ...values) {
    let errorHtml = strings[0];
    for (let i = 0; i < values.length; i++) {
      errorHtml += String(values[i]) + strings[i + 1];
    }
    return new Response(errorHtml, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  }

  self.html = html;

  /**
   * Finds a matching route for an incoming request using regex.
   * If a route matches, any captured parameters are attached to the request
   * as a new property `params` for use in the handler.
   *
   * @param {Request} request - The incoming request.
   * @returns {Function|null} - The route handler if found; otherwise, null.
   */
  function matchRoute(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    for (const route of routes) {
      if (route.method === request.method) {
        const match = pathname.match(route.regex);
        if (match) {
          const params = {};
          route.keys.forEach((key, index) => {
            // Decode the captured parameter before assigning.
            params[key] = decodeURIComponent(match[index + 1]);
          });
          request.params = params;
          return route.handler;
        }
      }
    }
    return null;
  }

  // -------------------- Fetch Event Handler --------------------

  // Intercept all fetch events and route them.
  self.addEventListener("fetch", (event) => {
    const handler = matchRoute(event.request);
    if (handler) {
      event.respondWith(handler(event.request));
    } else {
      event.respondWith(fetch(event.request));
    }
  });
} else {
  window.loadHtmxRouter = function loadHtmxRouter(
    file,
    { refreshOnUpdatedServiceWorker, type } = {
      refreshOnUpdatedServiceWorker: false,
      type: "module",
    }
  ) {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(file, { type }).then((registration) => {
        // Listen for the updatefound event on the registration.
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker.addEventListener("statechange", () => {
            // When the new service worker has been installed but is waiting to activate:
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("SWRX: New service worker installed and waiting.");
            }
          });
        });

        // Optionally, listen for controller changes, which indicates that the new SW has taken control.
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("SWRX: Service worker controller changed.");
          // For example, you could automatically refresh the page:
          if (refreshOnUpdatedServiceWorker) {
            if (
              typeof refreshOnUpdatedServiceWorker === "boolean" &&
              refreshOnUpdatedServiceWorker
            ) {
              console.log("SWRX: Reloading page.");
              window.location.reload();
            } else if (typeof refreshOnUpdatedServiceWorker === "string") {
              console.log("SWRX: Redirecting page.");
              window.location.href = refreshOnUpdatedServiceWorker;
            }
          }
        });
      });
    }
  };
}
