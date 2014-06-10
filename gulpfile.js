var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

var src = [ 'src/**/*.js' ];

gulp.task('debug', function () {
    return gulp.src(src)
        .pipe(concat('metro.debug.js'))
        .pipe(gulp.dest('.'));
});

gulp.task('watch', function () {
    gulp.watch(src, ['default']);
});

gulp.task('server', function (next) {
    var NodeServer = require('node-static'),
        server = new NodeServer.Server('.'),
        port = 8080;

    require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            server.serve(request, response);
        }).resume();
    }).listen(port, function () {
        console.log('Server listening on port: ' + port);
        next();
    });
});

gulp.task('release', function () {
    return gulp.src(src)
        .pipe(uglify())
        .pipe(concat('metro.js'))
        .pipe(gulp.dest('.'));
});

gulp.task('default', ['debug', 'release']);
gulp.task('develop', ['watch', 'server']);
