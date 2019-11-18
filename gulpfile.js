let isWATCH = false;

const { src, dest, series } = require('gulp');

var concat = require('gulp-concat');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var merge = require('merge2');
var gutil = require('gulp-util');

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
var watchify = require('watchify');
var fancy_log = require('fancy-log');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');

// var typescript = require('gulp-typescript');
// var tsProject = typescript.createProject("tsconfig.json");

var options = {
    basedir: '.',
    debug: true,
    entries: ['src/main.ts'],
    cache: {},
    packageCache: {}
};

const handlerBrowserify = () => browserify(options).plugin(tsify);
const watchedBrowserify = watchify(handlerBrowserify());

function clear(path = '*') {
	return src('build/' + path, {read: false})
	.pipe(clean());
};


function buildJS(done, watch) {
	return (watch? watchedBrowserify : handlerBrowserify())
  .bundle()
  .on('error', fancy_log)
  .pipe(source('bundle.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(uglify())
  .pipe(sourcemaps.write('./'))
  .pipe(dest('build'));
};

watchedBrowserify.on('update', buildJS);
watchedBrowserify.on('log', fancy_log);

exports.watch = (f) => buildJS(f, true);
exports.default = (f) => buildJS(f, false);
