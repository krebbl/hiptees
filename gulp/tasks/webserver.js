var gulp = require('gulp');

gulp.task('webserver', function () {
    var webserver = require('gulp-webserver');
    var proxy = require('http-proxy-middleware');

    gulp.src('public')
        .pipe(webserver({
            livereload: false,
            directoryListing: false,
            host: "0.0.0.0",
            open: false,
            //https: {
            //    key: '/Users/krebbl/key.pem',
            //    cert: '/Users/krebbl/cert.pem'
            //},
            // 192.168.99.100:32773
            // http://api.hiptees-api.f0dc3c97.svc.dockerapp.io:32773
            middleware: [
                proxy('/api/v1', {target: 'http://127.0.0.1:3000/', changeOrigin: false, xfwd: true}),
                proxy('/sprdApi/v1', {
                    target: 'http://api.spreadshirt.de', changeOrigin: true,
                    xfwd: true, pathRewrite: {"sprdApi": "api"}
                })
            ]
        }));
});