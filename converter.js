// should create woff + image
var exec = require('child_process').exec;


module.exports = {
    convertToImage: function (options, callback) {
        var src = options.src,
            dest = options.dest,
            size = options.size || 300,
            file = options.file || "Unknown",
            label = options.label || "Unknown",
            fill = options.fill || "white";

        exec('convert -background transparent -fill ' + fill + ' -font ' + src + ' -pointsize ' + size + ' -resize x60 label:"' + label + '" ' + dest + '.png', function (err, stdout, stderr) {
            if (err) {

            }
            callback && callback(err, null);
        });

    },
    ttf2Woff: function (options, callback) {
        var src = options.src,
            dest = options.dest;

        exec('ttf2woff ' + src + ' ' + dest, function (err, stdout, stderr) {
            if (err) {

            }
            callback && callback(err, null);
        });
    },
    otf2ttf: function (options, callback) {
        var src = options.src,
            dest = options.dest;

        exec('otf2ttf ' + src + ' ' + dest, function (err, stdout, stderr) {
            if (err) {

            }
            callback && callback(err, null);
        });
    }
};