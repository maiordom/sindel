'use strict';

const gulp = require('gulp');
const connect = require('gulp-connect');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const autoprefixer = require('gulp-autoprefixer');
const stylus = require('gulp-stylus');
const nib = require('nib');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const minifyCss = require('gulp-minify-css');
const replace = require('gulp-replace');
const runSequence = require('run-sequence');
const fs = require('fs');

const config = require('./package.json');

gulp.task('replace', () => {
    return gulp.src(`./src/${config.name}.js`)
        .pipe(replace('@utils', fs.readFileSync('./src/utils.js', 'utf8')))
        .pipe(replace('@widget', fs.readFileSync('./src/widget.js', 'utf8')))
        .pipe(gulp.dest('./dist'));
});

gulp.task('server', () => {
    return connect.server({
        port: 8089
    });
});

gulp.task('babel', () => {
    return gulp.src('./dist/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('stylus', () => {
    return gulp.src('./src/*.styl')
        .pipe(stylus({
            use: [nib()]
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('./dist'))
});

gulp.task('watch', () => {
    watch('./src/*.js', () => {
        runSequence('replace', ['babel']);
    });

    watch('./src/*.styl', () => {
        runSequence('stylus');
    });
});

gulp.task('min-js', () => {
    return gulp.src(`./dist/${config.name}.js`)
        .pipe(uglify())
        .pipe(rename(`${config.name}.min.js`))
        .pipe(gulp.dest('./dist'));
});

gulp.task('min-css', () => {
    return gulp.src(`./dist/${config.name}.css`)
        .pipe(minifyCss())
        .pipe(rename(`${config.name}.min.css`))
        .pipe(gulp.dest('./dist'));
});

gulp.task('js', () => {
    return runSequence('replace', ['babel']);
});

gulp.task('build', ['min-js', 'min-css']);
gulp.task('default', ['server', 'watch', 'js', 'stylus']);
