/* jshint node:true, -W079 */

'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var ssi = require('browsersync-ssi');
var autoprefixer = require('gulp-autoprefixer');

// 기존에 생성된 파일 삭제
gulp.task('clean', function (cb) {
  del([
      'ux/css/'
    ], cb);
});

// CSS
gulp.task('css', function () {
	return gulp.src(['ux/less/**/*.less', '!ux/less/**/_*.less'])
		.pipe($.plumber())
		.pipe($.less())
		.pipe(autoprefixer({
            browsers: ['> 1%','last 2 versions','android > 2.3'],
            cascade: false
        }))
		.pipe(gulp.dest('ux/css/'))
		.pipe($.if(browserSync.active, reload({stream: true})));
});

// Server
gulp.task('serve', ['css'], function () {
	browserSync({
		server: {
			baseDir: './',
			directory: true,
			codeSync: false,
			injectChanges: false,
			ghostMode: false,
			middleware: ssi({
				baseDir: './',
				ext: '.html'
			})
		},
	    watchOptions: {
	      interval: 500
	    }
	});

	gulp.watch('ux/less/**/*.less', { interval: 500 }, ['css']);
});

// Default
gulp.task('default', function (cb) {
	runSequence('clean', 'serve', cb);
});
