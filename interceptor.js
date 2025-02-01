htmx.defineExtension('requestInterceptor', {
    onEvent: function(name, evt) {
        if (name === "htmx:configRequest") {
            var detail = evt.detail;
            // Intercept the request
            if (detail.path === "/dummy-endpoint" || detail.path === "/submit") {
                // Emulate a response for both GET and POST requests
                setTimeout(function() {
                    var response = detail.path === "/dummy-endpoint" 
                        ? "<div>Emulated Response Content</div>" 
                        : "<div>Form submitted successfully!</div>";
                    htmx.trigger(detail.target, "htmx:beforeSwap", { serverResponse: response });
                    htmx.trigger(detail.target, "htmx:afterSwap", { serverResponse: response });
                }, 1000); // Simulate network delay
                return false; // Prevent the actual request
            }
        },
    isInlineSwap: function(swapStyle) {
        return swapStyle === "innerHTML";
    },
    handleSwap: function(swapStyle, target, fragment, settleInfo) {
        if (swapStyle === "innerHTML") {
            target.innerHTML = fragment.firstElementChild.outerHTML;
            return true;
        }
        return false;
    }
    }
});

htmx.onLoad(function() {
    htmx.process(document.body);
});
