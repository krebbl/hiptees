'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var exec = require('child_process').exec;

gulp.task('fonts', function (cb) {
    exec('node bin/convert-font-dir', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});