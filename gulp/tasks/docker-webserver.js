var gulp = require('gulp');
var webserver = require('gulp-webserver');
var proxy = require('http-proxy-middleware');

gulp.task('docker-webserver', function () {
    gulp.src('public-build')
        .pipe(webserver({
            livereload: false,
            directoryListing: false,
            host: "0.0.0.0",
            open: false,
            middleware: [
                proxy('/api/v1', {
                    target: "http://" + process.env.API_PORT_3000_TCP_ADDR + ":" + process.env.API_PORT_3000_TCP_PORT,
                    changeOrigin: false,
                    xfwd: true
                }),
                proxy('/sprdApi/v1', {
                    target: 'http://api.spreadshirt.de', changeOrigin: true,
                    xfwd: true, pathRewrite: {"sprdApi": "api"}
                })
            ]
        }));
});