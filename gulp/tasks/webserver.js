var gulp = require('gulp');
var webserver = require('gulp-webserver');
var proxy = require('http-proxy-middleware');

gulp.task('webserver', function () {
    gulp.src('public')
        .pipe(webserver({
            livereload: false,
            directoryListing: false,
            host: "0.0.0.0",
            open: false,
            middleware: [
                proxy('/api/v1', {target: 'http://localhost:3000', changeOrigin: true, xfwd: true})
            ]
        }));
});