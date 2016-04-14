define([], function () {

    return function (letterSpacing) {
        if (/PhantomJS/.test(window.navigator.userAgent)) {
            return (letterSpacing * 2) + "px";
        }
        return (letterSpacing * window.devicePixelRatio) + "px";
    }

});