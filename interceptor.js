htmx.defineExtension('requestInterceptor', {
    onEvent: function(name, evt) {
        if (name === "htmx:configRequest") {
            var detail = evt.detail;
            // Intercept the request
            if (detail.path === "/dummy-endpoint") {
                // Emulate a response
                setTimeout(function() {
                    var response = "<div>Emulated Response Content</div>";
                    htmx.trigger(detail.target, "htmx:beforeSwap", { serverResponse: response });
                    htmx.trigger(detail.target, "htmx:afterSwap", { serverResponse: response });
                }, 1000); // Simulate network delay
                return false; // Prevent the actual request
            }
        }
    }
});

htmx.onLoad(function() {
    htmx.process(document.body);
});
