var converter = require('./converter'),
    fs = require('fs'),
    flow = require('flow.js').flow;


var fontFamilyMap = {},
    curruptFontFamilies = [],
    fontFamilies = [],
    dir = './fonts';

function removeFontFamily(fontFamily) {
    var index = fontFamilies.indexOf(fontFamily);
    if (index > -1) {
        fontFamilies.splice(index, 1);
    }
    curruptFontFamilies.push(fontFamily);
}

function addFontToFamily(fontFamily, font, image) {
    if (curruptFontFamilies.indexOf(fontFamily) > -1) {
        return;
    }
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
    flow().seqEach(files, function (file, cb) {
        flow()
            .seq("file", function (cb) {
                if (file.indexOf(".otf") > -1) {
                    converter.otf2ttf({
                        src: __dirname + "/" + dir + "/" + file,
                        dest: dir
                    }, function (err) {
                        cb(err, file.replace(".otf", ".ttf"))
                    })
                } else if (/\.woff$/.test(file)) {
                    cb(null, file);
                } else if (/\.ttf$/.test(file)) {
                    cb(null, file);
                } else {
                    cb(file + " not supported");
                }

            })
            // return descr
            .seq("desc", function () {
                var file = this.vars.file;
                return {
                    file: file,
                    fileWOExtension: file.replace(/\.\w+$/, ""),
                    fontFamilyName: file.split(/_|-|\./).shift().replace(/([^A-Z])([A-Z])/g, '$1 $2')
                        // uppercase the first character
                        .replace(/^./, function (str) {
                            return str.toUpperCase();
                        })
                };
            })
            // create image
            .seq(function (cb) {
                var file = this.vars.desc.file;
                var fileWOExtension = this.vars.desc.fileWOExtension;
                var fontFamilyName = this.vars.desc.fontFamilyName;

                if (!/bold/i.test(file) && !/italic/i.test(file)) {

                    console.log(fontFamilyName);

                    var imagePath = "images/" + fontFamilyName.split(" ").join("");


                    converter.convertToImage({
                        src: __dirname + "/" + dir + "/" + file,
                        dest: __dirname + "/public/font/" + imagePath,
                        size: 150,
                        label: fontFamilyName
                    }, function (err) {
                        console.log(err);
                        if (!err) {
                            addFontToFamily(fontFamilyName, fileWOExtension, imagePath + ".png");
                        } else {
                            removeFontFamily(fontFamilyName);
                        }
                        cb(err);
                    });
                } else {
                    cb();
                }
            })
            .seq(function () {
                var file = this.vars.desc.file;
                var fileWOExtension = this.vars.desc.fileWOExtension;
                var fontFamilyName = this.vars.desc.fontFamilyName;

                fs.createReadStream(__dirname + "/" + dir + "/" + file).pipe(fs.createWriteStream(__dirname + "/" + "public/font" + "/" + file));

                if (file.indexOf("woff") === -1) {
                    converter.ttf2Woff({
                        src: __dirname + "/" + dir + "/" + file,
                        dest: __dirname + "/" + "public/font" + "/" + file.replace('.ttf', '.woff')
                    }, function (err) {
                        console.log(err);
                    });
                }

                addFontToFamily(fontFamilyName, fileWOExtension);
            }).exec(function (err) {
                console.log(err);
                cb();
            });
    }).exec(function () {
        fontFamilies.sort(function (f1, f2) {
            return f1.name > f2.name ? 1 : -1;
        });

        var families = JSON.stringify({fontFamilies: fontFamilies}, null, 2);


        fs.writeFileSync(process.cwd() + "/public/font/index.json", families);
    });


});