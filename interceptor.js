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
                    evt.detail.xhr.readyState = 4; // Set readyState to DONE
                    evt.detail.xhr.status = response.status; // Set status
                    evt.detail.xhr.statusText = response.statusText; // Set statusText
                    evt.detail.xhr.dispatchEvent(new Event('readystatechange')); // Dispatch readystatechange event
                    return htmlContent;
                } catch (error) {
                    console.error('Fetch error:', error);
                    evt.detail.xhr.responseText = '<div>Error loading content</div>';
                    evt.detail.xhr.readyState = 4;
                    evt.detail.xhr.status = 500;
                    evt.detail.xhr.statusText = 'Internal Server Error';
                    evt.detail.xhr.dispatchEvent(new Event('readystatechange'));
                    return '<div>Error loading content</div>';
                }
            };
        }
    }
});
