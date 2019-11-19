var gulp = require('gulp');

var concat = require('gulp-concat');
var clean = require('gulp-clean');
var source = require('vinyl-source-stream');
var fancy_log = require('fancy-log');

var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var browserSync = require('browser-sync').create();

function clear(path: any) {
	return gulp.src('build/' + path, {read: false})
	.pipe(clean());
};

function clearAll() {
  return clear('*');
}

function clearJS() {
  return clear('bundle.*');
}

function buildHTML() {
	return gulp.src('src/index.html')
	.pipe(gulp.dest('build/'));
}

var browserify = require('browserify');
var tsify = require('tsify');
var watchify = require('watchify');

const options = {
  basedir: '.',
  debug: true,
  entries: ['src/main.ts'],
  cache: {},
  packageCache: {}
};

const bundleBrowserify = browserify(options).plugin(tsify);
const watchedBrowserify = watchify(browserify(options).plugin(tsify));

watchedBrowserify.on('log', fancy_log);

function destJS(bundler: any) {
  return bundler
  .bundle()
  .on('error', fancy_log)
  .pipe(source('bundle.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('build/'));
}

function buildJS() {
	return destJS(bundleBrowserify);
};

function watchJS() {
  return destJS(watchedBrowserify);
}

async function initWatch() {
	watchedBrowserify.on('update', watchJS);
}

var isChange: boolean = false

function request(req: any, res: any, next: any) {
	if (!isChange) {
		return next();
	}

	isChange = false;
	const response = async () => next();
	gulp.series(watchJS, response)();
}

function runServer(done: any) {
	watchedBrowserify.on('update', () => isChange = true);

	browserSync.init({
    server: {
			baseDir: "./build/",
			middleware: [request]
		},
		ui: false,
		notify: false,
		logFileChanges: true
  });

	done();
}

exports.clearjs = clearJS;
exports.clearall = clearAll;
exports.watch = gulp.series(clearJS, initWatch, watchJS);
exports.run = gulp.series(clearJS, watchJS, runServer);
exports.default = gulp.series(clearAll, buildHTML, buildJS);
