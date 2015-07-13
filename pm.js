var webPage = require('webpage');
var page = webPage.create();

page.open('http://hip.js/text.html?asdasd', function (status) {

    var svg = page.evaluate(function () {
        return document.getElementById("svgContainer").innerHTML;
    });

    var fs = require('fs');

    fs.write('./generated/text.svg', svg, 'w');
    phantom.exit();
});