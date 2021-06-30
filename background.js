/**
* Background script.
*/

// Launch the url in flash player
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.url ) {
            fetch("http://localhost:35274/run?url=" + request.url);
        }
        sendResponse({});
    }
);