async function interceptor(event) {
    return `
        <div style="background-color:#f9f9f9; padding:1rem; border-radius:4px;">
            <h3>Intercepted Response</h3>
            <p>This HTML response was generated by the client-side interceptor instead of an actual HTTP request.</p>
        </div>`;
}

document.body.addEventListener("htmx:beforeRequest", async (event) => {
    event.preventDefault();
    const htmlResult = await interceptor(event);
    let target;
    target = event.detail.target
        ? (typeof event.detail.target === "string"
            ? document.querySelector(event.detail.target)
            : event.detail.target)
        : event.detail.elt;
    if (target) {
        target.innerHTML = htmlResult;
    } else {
        console.error("Interceptor: No valid target element found to inject the HTML result.");
    }
});

class FrontendServer {
    constructor() {
        this.routes = {};
    }

    register(method, path, handler) {
        if (!this.routes[method]) {
            this.routes[method] = {};
        }
        this.routes[method][path] = handler;
    }

    get(path, handler) {
        this.register('GET', path, handler);
    }

    handleRequest(url, method = 'GET', data = null) {
        if (this.routes[method] && this.routes[method][url]) {
            return this.routes[method][url](data);
        } else {
            throw new Error('Route not found');
        }
    }
}

const frontendServer = new FrontendServer();
frontendServer.get('/home', () => '<div>Home Page Content</div>');
frontendServer.get('/about', () => '<div>About Page Content</div>');
frontendServer.get('/contact', () => '<div>Contact Page Content</div>');

// Example of adding a POST route
frontendServer.register('POST', '/submit', (data) => {
    const name = data.name || 'Unknown';
    return `<div>Form Submitted. Hello, ${name}!</div>`;
});

htmx.defineExtension('interceptor', {
    onEvent: function (name, evt) {
        if (name === "htmx:beforeRequest") {
            evt.detail.path = async function (url, config) {
                try {
                    const method = config.method || 'GET';
                    const data = config.body ? Object.fromEntries(new URLSearchParams(config.body)) : null;
                    const htmlContent = frontendServer.handleRequest(url, method, data);
                    evt.detail.xhr.responseText = htmlContent;
                    evt.detail.xhr.readyState = 4;
                    evt.detail.xhr.status = 200;
                    evt.detail.xhr.statusText = 'OK';
                    evt.detail.xhr.dispatchEvent(new Event('readystatechange'));
                    return htmlContent;
                } catch (error) {
                    evt.detail.xhr.responseText = '<div>Error loading content</div>';
                    evt.detail.xhr.readyState = 4;
                    evt.detail.xhr.status = 404;
                    evt.detail.xhr.statusText = 'Not Found';
                    evt.detail.xhr.dispatchEvent(new Event('readystatechange'));
                    return '<div>Error loading content</div>';
                }
            };
        }
    }
});
