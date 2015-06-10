//modules
var gulp = require('gulp'), //걸프
	lessCss = require('gulp-less'), //LESS 컴파일
	minifyCss = require('gulp-minify-css'), // css 압축
	del = require('del'), // 파일,디렉토리 삭제
	rename = require('gulp-rename'), //파일 이름 변경
	plumber = require('gulp-plumber'); //에러가 나서 프로세스가 종료되는 것을 방지

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
gulp.task('default', ['clean', 'lessCss', 'watch']);

/* watch 변화를 감지 */
gulp.task('watch', ['clean'], function() {
	var watchOpt = {
		interval: 500
	};
	gulp.watch('less/**/*.less', watchOpt, ['lessCss']);
});

/* 폴더 및 파일 제거 - del module */
gulp.task('clean', function() {
	del(['css/*']);
});

/* less 파일 변환 및 압축 */
gulp.task('lessCss', function() {
	return gulp.src(['less/*.less','!less/_*.less'])
				.pipe(plumber())
				.pipe(lessCss())
				.pipe(gulp.dest('css/'))
				.pipe(minifyCss(options.minifyCss))
				.pipe(rename({
					suffix: '.min',
					extname: '.css'
				}))
				.pipe(gulp.dest('css/'));
});

