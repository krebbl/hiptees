var gulp = require('gulp');

gulp.task('build-webserver', function () {
    var webserver = require('gulp-webserver');
    var proxy = require('http-proxy-middleware');

    gulp.src('public-build')
        .pipe(webserver({
            livereload: false,
            directoryListing: false,
            host: "0.0.0.0",
            open: false,
            middleware: [
                proxy('/api/v1', {target: 'http://192.168.99.100:32773/', changeOrigin: false, xfwd: true}),
                proxy('/sprdApi/v1', {
                    target: 'http://api.spreadshirt.de', changeOrigin: true,
                    xfwd: true, pathRewrite: {"sprdApi": "api"}
                })
            ]
        }));
});