var request = require('request'),
    fs = require('fs');


request({
    // will be ignored
    method: 'GET',
    uri: 'https://www.spreadshirt.com/api/v1/shops/349065/fontFamilies',
    qs: {
        mediaType: "json",
        locale: "us_US",
        limit: 100,
        fullData: true
    },
    json: true
}, function (error, response, body) {
    if (response && response.statusCode == 200) {
        var fontFamilies = body.fontFamilies;
        for (var i = 0; i < fontFamilies.length; i++) {
            var fontFamily = fontFamilies[i];
            if (!fontFamily.deprecated) {
                for (var j = 0; j < fontFamily.fonts.length; j++) {
                    var font = fontFamily.fonts[j];
                    var name = fontFamily.name.replace(/\s+/g,"");
                    name += "_" + font.weight;
                    name += "_" + font.style;
                    downloadFont(name, font.resources[0].href);
                }
            }
        }
    }

});


function downloadFont(name, uri) {
    var extension = ".woff";
    request
        .get(uri + extension)
        .on('error', function (err) {
            console.log(err)
        })
        .pipe(fs.createWriteStream('./fonts/' + name + extension));
}