htmx.defineExtension('interceptor', {
    onEvent: function (name, evt) {
        if (name === "htmx:beforeRequest") {
            evt.detail.path = async function (url, config) {
                // Intercept the request and return HTML content
                const response = await fetch(url, config);
                const htmlContent = await response.text();
                return htmlContent;
            };
        }
    }
});

htmx.onLoad(function () {
    htmx.addExtension('interceptor');
});
