import { src, dest } from 'gulp'
import browserify from 'gulp-browserify'
import babelify from 'babelify'
import uglify from 'gulp-uglify'
import concat from 'gulp-concat'


export default () => 
    src('src.js')
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
  

export const jsProd = () => 
    src('src.js')
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