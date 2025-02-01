htmx.defineExtension('interceptor', {
    onEvent: function (name, evt) {
        if (name === "htmx:beforeRequest") {
            evt.detail.path = async function (url, config) {
                // Intercept the request and return HTML content
                try {
                    const response = await fetch(url, config);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const htmlContent = await response.text();
                    evt.detail.xhr.responseText = htmlContent;
                    return htmlContent;
                } catch (error) {
                    console.error('Fetch error:', error);
                    evt.detail.xhr.responseText = '<div>Error loading content</div>';
                    return '<div>Error loading content</div>';
                }
            };
        }
    }
});
