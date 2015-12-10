
'use strict';

//modules
var gulp = require('gulp'),
	plugins = require('gulp-load-plugins')(),
	runSequence = require('run-sequence'),
	del = require('del'),
	browserSync = require('browser-sync').create(),
	browserslist = require('browserslist');

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
		'root'
	]);
});

// less compile & compress
gulp.task('lessCss', function() {
	return gulp.src(['resource/less/*.less','!resource/less/_*.less'])
		.pipe(plugins.plumber())
		.pipe(plugins.sourcemaps.init())
			.pipe(plugins.less())
			.pipe(plugins.autoprefixer(
					browserslist('last 2 version',' > 30%','Chrome','Safari', 'ie 7-9','iOS 7','Opera','Firefox'),
					{ cascade : true}
				)
			)
			.pipe(gulp.dest('root/css/'))
			.pipe(plugins.minifyCss(options.minifyCss))
			.pipe(plugins.rename({
				suffix: '.min',
				extname: '.css'
			}))
		.pipe(plugins.sourcemaps.write('../maps/'))
		.pipe(gulp.dest('root/css/'))
		.pipe(reLoading());
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
		.pipe(reLoading());
});

// file copy
/*gulp.task('uglifyJsCopy', function() {
	gulp.src(['resource/js/*min.js'])
		.pipe(gulp.dest('root/js/'));
});*/

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
		.pipe(reLoading());
});


// html build, html hint
gulp.task('htmlBuild', function () {
	return gulp.src(['resource/html/**/*.html'])
		.pipe(plugins.plumber())
		.pipe(plugins.lbInclude({
			root: 'resource/html/'
		}))
		.pipe(plugins.filter([
			'**/*',
			//'!_*',
			//'!_*/**/*',
			'!include/**/*.html'
		]))
		.pipe(plugins.htmlhint({
			htmlhintrc: '.htmlhintrc'
		}))
		.pipe(plugins.htmlhint.reporter())
		.pipe(gulp.dest('root/'))
		.pipe(plugins.if(browserSync.active, browserSync.stream({
			once: true
		})));
});


// start
gulp.task('start', ['lessCss', 'uglifyJs', 'optimizeImg', 'htmlBuild'], function() {
	var watchOpt = {
		interval: 500
	};

	gulp.watch('resource/less/**/*.less', watchOpt, ['lessCss']);
	gulp.watch('resource/js/**/*.js', watchOpt, ['uglifyJs']);
	gulp.watch('resource/imgs/**/*.{png,jpg,gif}', watchOpt, ['optimizeImg']);
	gulp.watch('resource/html/**/*.html', watchOpt, ['htmlBuild']);
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

function reLoading(){
	//브라우저 싱크가 활성화일때 리로드실행
	if( browserSync.active ){
		return browserSync.reload({stream: true});
	}
	return plugins.util.noop(); //아무것도 하지않는 스트림을 리턴
}

//default step
gulp.task('default', function(callback) {
	runSequence('clean','start','browserSync',callback);
});
