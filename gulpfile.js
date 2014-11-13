var gulp = require('gulp');
var karma = require('karma').server;
var concat = require('gulp-concat');
var es6ModuleTranspiler = require("gulp-es6-module-transpiler");
var browserify = require('gulp-browserify');
var browserify = require('browserify');
var source = require('vinyl-source-stream')

var paths = ['src/**/*.js']

/**
 * Run test and watches for changes
 */
gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false
  }, done);
});

gulp.task('scripts', function () {

	var bundleStream = browserify('./src/sandwich.js').bundle();

	bundleStream
		.pipe(source('sandwich.js'))
		.pipe(gulp.dest('./dist'))

	/*gulp.src(paths)
		.pipe(es6ModuleTranspiler({

			type: 'cjs'
		}))
		// .pipe(concat('pbjs.js'))
		.pipe(gulp.dest('./tmp'));*/

	/*gulp.src(['./src/main.js'])
		.pipe(browserify({
          insertGlobals : true,
          debug : true
        }))
        .pipe(gulp.dest('./dist'));*/
});

gulp.task('default', ['scripts']);