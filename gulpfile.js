var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    watch = require('gulp-watch'),
    cssmin = require("gulp-cssmin"),
    rename = require("gulp-rename"),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync  = require('browser-sync');

gulp.task('sass', function() {
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass())
        .pipe(autoprefixer({
            cascade: true
        }))
        .pipe(gulp.dest('app/css'))
        .pipe(sourcemaps.init())
        .pipe(cssmin())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/css'));
        // .pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts', function () {
        return gulp.src(['app/js/**/*.js', '!app/js/app.min.js', '!app/js/app.js', '!app/js/bootstrap.js', '!app/js/jasny-bootstrap.js'])
            .pipe(concat('app.js'))
            .pipe(gulp.dest('app/js/'))
            .pipe(sourcemaps.init())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(sourcemaps.write())
            .on('error', function (e) {
                console.log(e);
            })
            .pipe(gulp.dest('app/js/'))
            // .pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browserSync
        server: { // Определяем параметры сервера
            baseDir: 'app' // Директория для сервера - app
        },
        browser: ["chrome", "firefox"],
        notify: false // Отключаем уведомления
    });
});

gulp.task('watch',['browser-sync', 'sass', 'scripts'], function() {
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/js/**/*.js', ['scripts']);
    gulp.watch('app/css/*.css', browserSync.reload);
    gulp.watch('app/**/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});
gulp.task('default', ['watch']);
