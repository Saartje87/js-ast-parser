var gulp = require('gulp'),
	watch = require('gulp-watch'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	concat = require('gulp-concat'),
	browserify = require("browserify"),
	babelify = require("babelify"),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	uglify = require('gulp-uglify'),
	browserSync = require('browser-sync');
	reload = browserSync.reload,
	notify = require('gulp-notify'),
	karma = require('karma').server;

var project = {

	name: 'SandwichJS'
};

gulp.task('default', ['build-js']);

/**
 * Watchers
 */
gulp.task('watch', ['browser-sync', 'build-js' /*,'test-js'*/], function () {

	gulp.watch('src/**/*.js', ['build-js']);
	gulp.watch(['tests/**/*.js', 'dist/**/*.js'], ['test-js']);
	gulp.watch('sass/**/*.scss', ['build-sass']);
});

/**
 * Build js
 */
gulp.task('build-js', function () {

	browserify({ debug: true })
		.transform(babelify.configure())
		.require('./src/index.js', { entry: true })
		.bundle()
		.on("error", function (err) { console.log("Error : " + err.message); })
		.pipe(source('ast.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
		// .pipe(uglify())
		.pipe(sourcemaps.write('./')) // writes .map file
		.pipe(gulp.dest('dist/'))
		.pipe(reload({stream:true})); // @todo needed?
});

/**
 * Mhh karma could proberly be better runned from the command line, much better performance
 */
gulp.task('test-js', function () {

	karma.start({

		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, function ( result ) {

		gulp.src('./src/index.js')
			.pipe(notify({

				title: (result) ? 'Tests failed!' : 'Tests passed',
				message: project.name,
				icon: void 0,
				sound: (result) ? 'Basso' : 'Pop',
				wait: false
			}));
	});
});

/**
 *
 */
gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: './',
			directory: true
		},
		files: ['dist/**/*.js', '**/*.html']
	});
});
