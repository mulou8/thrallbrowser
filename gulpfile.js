var gulp        = require('gulp');
var util        = require('gulp-util');
var less        = require('gulp-less');
var concatCss   = require('gulp-concat-css');
var browserify  = require('browserify');
var source      = require('vinyl-source-stream');
var browserSync = require('browser-sync');
var path        = require('path');
var historyApiFallback = require('connect-history-api-fallback');

var ignoreErrors = true;

var bundler = browserify({
    entries      : ['app/app.js'],
    transform    : ['babelify'],
    debug        : true,
    insertGlobals: true,
    fullPaths    : true,
});

gulp.task('scripts', function(cb) {
    function logBrowserifyError(err) {
        console.log(err.message);
        if(err.codeFrame) {
            console.log('==============');
            console.log(err.codeFrame);
            console.log('==============');
        }
    }

    function onErrorIgnore(err) {
        logBrowserifyError(err);
        if (cb) {cb(); cb = null}
    }

    function onError(err) {
        logBrowserifyError(err);
        process.exit(1);
    }

    return bundler
        .bundle()
        .on('log', util.log)
        .on('error', ignoreErrors ? onErrorIgnore : onError)
        .pipe(source('app.js'))
        .pipe(gulp.dest('dist'))
});

gulp.task('index', function() {
    return gulp.src('app/index.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('html', function() {
    return gulp.src(['app/**/*.html', '!app/index.html'])
        .pipe(gulp.dest('dist'));
});

gulp.task('styles', function() {
    return gulp.src('app/**/*.less')
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(concatCss('app.css', {
            rebaseUrls: false
        }))
        .pipe(gulp.dest('dist/'))
});

gulp.task('images', function() {
    return gulp.src('images/**/*.*')
        .pipe(gulp.dest('dist/images'))
});

gulp.task('fonts', function() {
    return gulp.src('fonts/**/*.*')
        .pipe(gulp.dest('dist/fonts'))
});

gulp.task('vendors', function() {
    return gulp.src('vendor/**/*.*')
        .pipe(gulp.dest('dist/vendor'))
});

gulp.task('watch', ['build'], function() {
    browserSync({
        port     : 8080,
        open     : true,
        ui       : false,
        notify   : false,
        ghostMode: false,
        logPrefix: 'BS',
        logLevel : 'silent',
        server   : {
            baseDir: 'dist',
            middleware: [ historyApiFallback() ]
        },
    });

    gulp.watch('app/index.html', ['index']);
    gulp.watch('app/**/*.js', ['scripts']);
    gulp.watch('app/**/*.less', ['styles']);
    gulp.watch('images/**/*.*', ['images']);
    gulp.watch('fonts/**/*.*', ['fonts']);
    gulp.watch(['app/**/*.html', '!app/index.html'], ['html']);
    gulp.watch('dist/**/*.*', browserSync.reload);
});

gulp.task('build', ['scripts', 'index', 'styles', 'html', 'vendors', 'images', 'fonts']);

gulp.task('default', function() {
    ignoreErrors = false;
    return gulp.start('build');
});
