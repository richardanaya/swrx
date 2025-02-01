class FrontendServer {
    constructor() {
        this.routes = {};
    }

    get(path, handler) {
        this.routes[path] = handler;
    }

    handleRequest(url) {
        if (this.routes[url]) {
            return this.routes[url]();
        } else {
            throw new Error('Route not found');
        }
    }
}

const frontendServer = new FrontendServer();
frontendServer.get('/home', () => '<div>Home Page Content</div>');
frontendServer.get('/about', () => '<div>About Page Content</div>');
frontendServer.get('/contact', () => '<div>Contact Page Content</div>');

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
