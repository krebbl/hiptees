var converter = require('./converter'),
    fs = require('fs'),
    flow = require('flow.js').flow;


var fontFamilyMap = {},
    fontFamilies = [],
    dir = './fonts';

function addFontToFamily(fontFamily, font, image) {

    var familyObject;
    for (var i = 0; i < fontFamilies.length; i++) {
        var ff = fontFamilies[i];
        if (ff.name == fontFamily) {
            familyObject = ff;
            break;
        }
    }
    if (!familyObject) {
        familyObject = {
            name: fontFamily
        };
        fontFamilies.push(familyObject);
    }

    if (image) {
        familyObject.image = image;
    }

    var key,
        isBold = /bold/i.test(font),
        isItalic = /italic/i.test(font);
    if (isBold && isItalic) {
        key = "boldItalic";
    } else if (isItalic) {
        key = "italic";
    } else if (isBold) {
        key = "bold";
    } else {
        key = "regular";
    }

    familyObject[key] = font;
}

fs.readdir('./fonts', function (err, files) {
    files.forEach(function (file) {
        flow()
            .seq("ttf", function (cb) {
                if (file.indexOf(".otf") > -1) {
                    converter.otf2ttf({
                        src: __dirname + "/" + dir + "/" + file,
                        dest: dir
                    }, function (err) {
                        cb(err, file.replace(".otf", ".ttf"))
                    })
                } else if (file.indexOf(".ttf") > -1) {
                    cb(null, file);
                } else {
                    cb(file + "not supported");
                }

            })
            .seq(function () {
                var file = this.vars.ttf;
                var fontFamilyName = file.split(/_|-|\./).shift();

                fontFamilyName = fontFamilyName// insert a space before all caps
                    .replace(/([^A-Z])([A-Z])/g, '$1 $2')
                    // uppercase the first character
                    .replace(/^./, function (str) {
                        return str.toUpperCase();
                    });

                if (!/bold/i.test(file) && !/italic/i.test(file)) {

                    console.log(fontFamilyName);

                    var imagePath = "images/" + fontFamilyName.split(" ").join("");

                    addFontToFamily(fontFamilyName, file.replace('.ttf', ''), imagePath + ".png");

                    converter.convertToImage({
                        src: __dirname + "/" + dir + "/" + file,
                        dest: __dirname + "/public/font/" + imagePath,
                        size: 150,
                        label: fontFamilyName
                    }, function (err) {

                        console.log(err);

                    });
                }

                fs.createReadStream(__dirname + "/" + dir + "/" + file).pipe(fs.createWriteStream(__dirname + "/" + "public/font" + "/" + file));

                converter.ttf2Woff({
                    src: __dirname + "/" + dir + "/" + file,
                    dest: __dirname + "/" + "public/font" + "/" + file.replace('.ttf', '.woff')
                }, function (err) {
                    console.log(err);
                });

                addFontToFamily(fontFamilyName, file.replace('.ttf', ''));
            }).exec();

    });

    var families = JSON.stringify({fontFamilies: fontFamilies}, null, 2);


    fs.writeFileSync(process.cwd() + "/public/font/index.json", families);
});