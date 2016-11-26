var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    watch = require('gulp-watch'),
    cssmin = require("gulp-cssmin"),
    rename = require("gulp-rename"),
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
gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browserSync
        server: { // Определяем параметры сервера
            baseDir: 'app' // Директория для сервера - app
        },
        browser: ["chrome", "firefox"],
        notify: false // Отключаем уведомления
    });
});

gulp.task('watch',['browser-sync', 'sass'], function() {
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/css/*.css', browserSync.reload);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});
gulp.task('default', ['watch']);
