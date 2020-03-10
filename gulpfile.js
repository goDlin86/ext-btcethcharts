const { dest } = require('gulp')
const browserify = require('browserify')
const babelify = require('babelify')
const source = require('vinyl-source-stream')
const uglify = require('gulp-uglify')
const streamify = require('gulp-streamify')


function js() {
    return browserify({
            entries: 'src.js',
            extensions: ['.js'],
            debug: true
        })
        .transform(babelify, {presets: ['@babel/react', '@babel/env']})
        .bundle()
        .pipe(source('main.js'))
        .pipe(dest('./'))
}

function jsProd() {
    return browserify({
            entries: 'src.js',
            extensions: ['.js'],
            debug: true
        })
        .transform(babelify, {presets: ['@babel/react', '@babel/env']})
        .bundle()
        .pipe(source('main.js'))
        .pipe(streamify(uglify()))
        .pipe(dest('./'))
}

exports.js = js
exports.prod = jsProd