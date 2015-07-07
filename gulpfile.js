//modules
var gulp = require('gulp'),
	//$ = require('gulp-load-plugins');
	lessCss = require('gulp-less'), //LESS 컴파일
	minifyCss = require('gulp-minify-css'), // css 압축
	uglifyJs = require('gulp-uglify'), //js 압축
	optimizeImg = require('gulp-imagemin'), //이미지 압축
	del = require('del'), // 파일,디렉토리 삭제
	rename = require('gulp-rename'), //파일 이름 변경
	plumber = require('gulp-plumber'), //에러가 나서 프로세스가 종료되는 것을 방지
	browserSync = require('browser-sync').create(); //브라우저싱크 서버

//option
var options = {
	minifyCss: {
		advanced: false,
		aggressiveMerging: false,
		compatibility: 'ie7'
	},
	uglify: {
		mangle: false,
		compress: false,
		preserveComments: 'some'
	}
};

// Default working
gulp.task('default', ['clean', 'lessCss', 'watch', 'uglifyJs', 'uglifyJsCopy', 'optimizeImg']);


// remove file & directory
gulp.task('clean', function() {
	del([
		'css/*',
		'js/*',
		'imgs/*'
	]);
});

// less compile & compress
gulp.task('lessCss', function() {
	return gulp.src(['resource/less/*.less','!resource/less/_*.less'])
				.pipe(plumber())
				.pipe(lessCss())
				.pipe(gulp.dest('css/'))
				.pipe(minifyCss(options.minifyCss))
				.pipe(rename({
					suffix: '.min',
					extname: '.css'
				}))
				.pipe(gulp.dest('css/'))
				.pipe(browserSync.reload({stream: true}));
});

// js file compress
gulp.task('uglifyJs', function() {
	return gulp.src(['resource/js/*.js','!resource/js/_*.js','!resource/js/*min.js'])
				.pipe(plumber())
				.pipe(uglifyJs())
				.pipe(rename({
					suffix: '.min',
					extname: '.js'
				}))
				.pipe(gulp.dest('js/'))
				.pipe(browserSync.reload({stream: true}));
});

// image file compress
gulp.task('optimizeImg', function() {
	return gulp.src(['resource/imgs/*.{png,jpg,gif}'])
				.pipe(plumber())
				.pipe(optimizeImg({
					optmizationLevel: 3,
					progressive: true,
					interlaced: true
				}))
				.pipe(gulp.dest('imgs/'))
				.pipe(browserSync.reload({stream: true}));
});

// file copy
gulp.task('uglifyJsCopy', function() {
	return gulp.src(['resource/js/*min.js'])
			   .pipe(gulp.dest('js/'))
			   .pipe(browserSync.reload({stream: true}));

});


// watch file
gulp.task('watch', ['clean'], function() {
	var watchOpt = {
		interval: 500
	};
    browserSync.init({
        server: {
            baseDir: "./",
			directory: true,
			index: "swipe.html"
        }
    });
	gulp.watch('resource/less/**/*.less', watchOpt, ['lessCss']);
	gulp.watch('resource/js/**/*.js', watchOpt, ['uglifyJs','uglifyJsCopy']);
	gulp.watch('resource/imgs/**/*.{png,jpg,gif}', watchOpt, ['optimizeImg']);
});
