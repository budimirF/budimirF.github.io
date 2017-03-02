'use strict';
var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssmin = require("gulp-cssmin"),
    rename = require("gulp-rename"),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    del = require('del'),
    browserSync = require('browser-sync').create(),
    notify = require('gulp-notify'),
    combiner = require('stream-combiner2').obj,
    nodemon = require('gulp-nodemon');

gulp.task('clean', function() {
    return del('public')
})


gulp.task('sass', function() {
    return combiner(
        gulp.src('app/scss/**/*.scss'),
        sass(),
        autoprefixer({
            cascade: true
        }),
        gulp.dest('public/css'),
        sourcemaps.init(),
        cssmin(),
        rename({
            suffix: '.min'
        }),
        sourcemaps.write(),
        gulp.dest('public/css')
    ).on('error', notify.onError());
});

gulp.task('scripts', function() {
    return gulp.src('app/js/**/*.js', '!app/js/lib/*.*')
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        // .pipe(gulp.dest('public/js/'))  // include for production
        // .pipe(rename({
        //     suffix: '.min'
        // }))
        // .pipe(babel({ presets: ['es2015']}))
        // .pipe(uglify())
        .pipe(sourcemaps.write())
        .on('error', function(e) {
            console.log(e);
        })
        .pipe(gulp.dest('public/js/'))
});

gulp.task('static', function() {
    return gulp.src(['app/**/*.html', 'app/js/lib/*.*', 'app/fonts/*.*', 'app/css/*.*', 'app/img/*.*'], {since: gulp.lastRun('static')})
        .pipe(gulp.dest(function(file) {
            var base = file.base;
            return base.replace('app', 'public');
        }))
})

gulp.task('build', gulp.series('clean', 'static', gulp.parallel('sass', 'scripts')))

gulp.task('watch', function() {
    gulp.watch('app/scss/**/*.scss', gulp.series('sass'));
    gulp.watch('app/js/**/*.js', gulp.series('scripts'));
    gulp.watch('app/**/*.html', gulp.series('static'));
})

gulp.task('demon', function () {
  nodemon({
    script: 'server.js',
    ext: 'js',
    watch: ['server/**/*.*', 'server.js']
  })
    // .on('change', browserSync.reload)
    .on('restart', function () {
      console.log('restarted!');
    });
});

gulp.task('serve', function() {
    browserSync.init({
        port: 3700,
        proxy: {
            target: "http://localhost:3000",
            ws: true
        },
        browser: ["chrome"],
    });
    browserSync.watch('public/**/*.*').on('change', browserSync.reload)
});

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'serve', 'demon')));
