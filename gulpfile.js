
'use strict';

//modules
var gulp = require('gulp'),
	plugins = require('gulp-load-plugins')(),
	runSequence = require('run-sequence'),
	bower = require('gulp-bower'),
	del = require('del'),
	browserSync = require('browser-sync').create();

//option
var options = {
	minifyCss : {
		advanced: false,
		aggressiveMerging: false,
		compatibility: 'ie7'
	},
	uglify : {
		mangle: false,
		compress: false,
		preserveComments: 'some'
	}
};

// remove file & directory
gulp.task('clean', function() {
	del([
		'root/css/*',
		'root/js/*',
		'root/imgs/*',
		'root/maps/*'
	]);
});

// less compile & compress
gulp.task('lessCss', function() {
	return gulp.src(['resource/less/*.less','!resource/less/_*.less'])
				.pipe(plugins.plumber())
				.pipe(plugins.sourcemaps.init())
					.pipe(plugins.less())
					.pipe(gulp.dest('root/css/'))
					.pipe(plugins.minifyCss(options.minifyCss))
					.pipe(plugins.rename({
						suffix: '.min',
						extname: '.css'
					}))
				.pipe(plugins.sourcemaps.write('../maps/'))
				.pipe(gulp.dest('root/css/'))
 			   .pipe(browserSync.reload({stream: true}));
});

// js file compress
gulp.task('uglifyJs', function() {
	return gulp.src(['resource/js/*.js','!resource/js/_*.js','!resource/js/*min.js'])
				.pipe(plugins.plumber())
				.pipe(plugins.sourcemaps.init())
					.pipe(plugins.uglify())
					.pipe(plugins.rename({
						suffix: '.min',
						extname: '.js'
					}))
				.pipe(plugins.sourcemaps.write('../maps/'))
				.pipe(gulp.dest('root/js/'))
 			   .pipe(browserSync.reload({stream: true}));
});

// image file compress
gulp.task('optimizeImg', function() {
	return gulp.src(['resource/imgs/*.{png,jpg,gif}'])
				.pipe(plugins.plumber())
				.pipe(plugins.imagemin({
					optmizationLevel: 3,
					progressive: true,
					interlaced: true
				}))
				.pipe(gulp.dest('root/imgs/'))
 			   .pipe(browserSync.reload({stream: true}));
});

// file copy
gulp.task('uglifyJsCopy', function() {
	return gulp.src(['resource/js/*min.js'])
			   .pipe(gulp.dest('root/js/'))
			  .pipe(browserSync.reload({stream: true}));

});

//package manager
gulp.task('bower',function(){
	bower('./lib');
	gulp.src([
			'lib/jquery/dist/jquery.min.js',
			'lib/jquery-easing-original/jquery.easing.min.js'
		])
		.pipe(gulp.dest('root/js/'));
});

// start
gulp.task('start', ['lessCss', 'uglifyJs', 'uglifyJsCopy', 'optimizeImg'], function() {
	var watchOpt = {
		interval: 500
	};

	gulp.watch('resource/less/**/*.less', watchOpt, ['lessCss']);
	gulp.watch('resource/js/**/*.js', watchOpt, ['uglifyJs','uglifyJsCopy']);
	gulp.watch('resource/imgs/**/*.{png,jpg,gif}', watchOpt, ['optimizeImg']);
});

gulp.task('browserSync',function(){
	browserSync.init({
		server : {
			baseDir: "./root/",
			index: "root/swipe.html",
			directory: true,
			codeSync: false,
			injectChanges: true,
			ghostMode: false
		},
		port : 5000
	});
});

//default step
gulp.task('default', function(callback) {
	runSequence('clean','start','bower','browserSync',callback);
});
