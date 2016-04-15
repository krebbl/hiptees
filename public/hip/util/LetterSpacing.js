define([], function () {

    return function (letterSpacing) {
        if (/PhantomJS/.test(window.navigator.userAgent)) {
            return (letterSpacing * 2) + "px";
        }

        if (/iPhone/.test(window.navigator.platform)) {
            return (letterSpacing * window.devicePixelRatio) + "px";
        }

        return letterSpacing;
    }

});