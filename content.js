/**
* Content script to run on all pages.
*/

/**
 * Look at the page for Flash content.
 */
function lookAt() {
    console.log("hello");
    document.querySelectorAll("embed:not(.pullupflash-looked-at), iframe:not(.pullupflash-looked-at), param[name='movie']:not(.pullupflash-looked-at)").forEach( function(el) {
        // find the url
        var url = el.src;
        if( el.tagName == "PARAM" ) {
            url = el.getAttribute("value");
            el = el.parentElement;
            if( el.querySelector("embed, iframe") ) return;
        }
        if( !url ) return;
        if( !url.match(/\.swf(\?.+)?$/) ) return;
        el.classList.add("pullupflash-looked-at");

        // create the overlay element
        var div = document.createElement("div");
        div.classList.add("pullupflash-container");
        function setStyles() {
            var styles = window.getComputedStyle(el);
            var madeDisplay = false;
            if( styles.getPropertyValue("display") == "none" ) {
                madeDisplay = true;
                el.style.display = "block";
            }
            
            var rectangle = el.getBoundingClientRect();
            var newStyles = [];
            var top = rectangle.top + (window.pageYOffset || document.documentElement.scrollTop);
            var left = rectangle.left + (window.pageXOffset || document.documentElement.scrollLeft);
            newStyles.push("top: " + top + "px");
            newStyles.push("left: " + left + "px");
            newStyles.push("width: " + styles.getPropertyValue(["width"]));
            newStyles.push("height: " + styles.getPropertyValue(["height"]));
            div.setAttribute("style", newStyles.join(";"));
            if( madeDisplay ) {
                el.style.display = "none";
            }
        }
        setStyles();
        var observer = new ResizeObserver(setStyles)
        observer.observe(el);
        observer.observe(el.parentElement);
        
        // add the overlay element and set onclick
        div.classList.add("pullupflash-container");
        var launching = false;
        div.onclick = function() {
            if( launching ) return;
            launching = true;
            chrome.runtime.sendMessage({
                url: url
            }, function(response) {
                launching = false;
            });
        }
        
        document.body.appendChild(div);
    } );
}

/**
 * Run on load.
 */
window.addEventListener("load", function() {
    lookAt();
    new MutationObserver(lookAt).observe(document.body, { attributes: true, childList: true, subtree: true });
});