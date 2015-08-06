var webPage = require('webpage');
var page = webPage.create();

page.open('http://hip.js/printout.html#/55c284e2f78e2d64819b2a76', function (status) {

    var svg = page.evaluate(function () {

//        document.getElementById("svgContainer").innerHTML;

    });

    page.viewportSize = { width: 4000, height: 1000 };


    setTimeout(function () {
        page.render('./generated/printout.png', {format: 'png'});
        phantom.exit();
    }, 2000);

});