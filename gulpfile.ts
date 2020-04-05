var gulp = require('gulp');

var concat = require('gulp-concat');
var clean = require('gulp-clean');
var source = require('vinyl-source-stream');
var fancy_log = require('fancy-log');

var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var browserSync = require('browser-sync').create();
var browserify = require('browserify');
var babelify = require('babelify');
var tsify = require('tsify');
var watchify = require('watchify');


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

function createBundler() {
	return browserify({
		entries: ['src/utils/index.ts', 'src/main.ts'],
		debug: true
	})
	.plugin(tsify);
}

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

function buildLibs() {
	return browserify({
		entries: 'src/libs/main.ts',
		debug: true
	})
	.plugin(tsify, {
		files: ['src/libs/main.ts'],
		allowJs: true
	})
	.transform(babelify, {
		only: ["./src/libs/*"],
		plugins: ['@babel/plugin-transform-modules-commonjs']
	})
	.bundle()
	.on('error', fancy_log)
	.pipe(source('libs.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('build/'));
}

function buildJS() {
	return destJS(createBundler());
};

function runServer(done: any) {
	const watchedBrowserify = watchify(createBundler());
	const build = () => destJS(watchedBrowserify);
	let isChange: boolean = false;
	const request = (req: any, res: any, next: any) => {
		if (!isChange) {
			return next();
		}

		isChange = false;
		const response = async () => next();
		gulp.series(build, response)();
	}

	browserSync.init({
    server: {
			baseDir: "./build/",
			middleware: [request]
		},
		ui: false,
		notify: false,
		logFileChanges: true
  });

	watchedBrowserify
	.on('log', fancy_log)
	.on('update', (files:any) => {
		isChange = true;
		fancy_log(files[0]);
	});

	return build();
}

const init = gulp.parallel(buildHTML, buildLibs);

exports.clearjs = clearJS;
exports.clearall = clearAll;
exports.buildlibs = buildLibs;
exports.init = init;
exports.run = gulp.series(init, clearJS, runServer);
exports.default = gulp.series(clearJS, buildJS);
