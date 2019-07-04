var gulp = require('gulp'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    uglify = require('gulp-uglify'),
    streamify = require('gulp-streamify')

gulp.task('default', function() {
    return browserify({
          entries: 'src.js',
          extensions: ['.js'],
          debug: true
        })
        .transform(babelify, {presets: ['@babel/react', '@babel/env']})
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest('./'));
})

gulp.task('production', function() {
    process.env.NODE_ENV = 'production';
    return browserify({
          entries: 'src.js',
          extensions: ['.js'],
          debug: true
        })
        .transform(babelify, {presets: ['@babel/react', '@babel/env']})
        .bundle()
        .pipe(source('main.js'))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest('./'));
})