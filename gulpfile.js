const { src, dest } = require('gulp')
const browserify = require('gulp-browserify')
const babelify = require('babelify')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')


function js() {
    return src('src.js')
      .pipe(browserify({
        //insertGlobals: true, 
        debug: true,
        transform: [babelify.configure({
          presets: ['@babel/env', '@babel/react']
          //sourceMaps: true
        })]
      }))
      .pipe(concat('main.js'))
      .pipe(dest('.'))
  }

function jsProd() {
    return src('src.js')
        .pipe(browserify({
            //insertGlobals: true, 
            debug: false,
            transform: [babelify.configure({
                presets: ['@babel/env', '@babel/react']
                //sourceMaps: true
            })]
        }))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(dest('.'))
}

exports.js = js
exports.prod = jsProd