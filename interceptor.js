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
        this.routes[path] = handler;
    }

    handleRequest(url) {
        const method = 'GET'; // For simplicity, assuming GET requests for now
        if (this.routes[method] && this.routes[method][url]) {
            return this.routes[method][url]();
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
frontendServer.register('POST', '/submit', () => '<div>Form Submitted</div>');

htmx.defineExtension('interceptor', {
    onEvent: function (name, evt) {
        if (name === "htmx:beforeRequest") {
            evt.detail.path = async function (url, config) {
                try {
                    const htmlContent = frontendServer.handleRequest(url);
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
