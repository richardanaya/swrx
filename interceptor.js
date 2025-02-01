htmx.defineExtension('interceptor', {
    onEvent: function (name, evt) {
        if (name === "htmx:beforeRequest") {
            const routes = {
                '/home': () => '<div>Home Page Content</div>',
                '/about': () => '<div>About Page Content</div>',
                '/contact': () => '<div>Contact Page Content</div>',
            };

            evt.detail.path = async function (url, config) {
                // Intercept the request and return HTML content based on route
                try {
                    if (routes[url]) {
                        const htmlContent = routes[url]();
                        evt.detail.xhr.responseText = htmlContent;
                        evt.detail.xhr.readyState = 4; // Set readyState to DONE
                        evt.detail.xhr.status = 200; // Set status
                        evt.detail.xhr.statusText = 'OK'; // Set statusText
                        evt.detail.xhr.dispatchEvent(new Event('readystatechange')); // Dispatch readystatechange event
                        return htmlContent;
                    } else {
                        throw new Error('Route not found');
                    }
                } catch (error) {
                    console.error('Routing error:', error);
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
