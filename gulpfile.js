// 引用外掛
const gulp = require('gulp'),
			// clean
			del = require('del'),
			// pug
			pug = require('gulp-pug'),
			// postCss
			postcss = require('gulp-postcss'),
			autoprefixer = require('autoprefixer'),
			sass = require('gulp-sass'),
			lost = require('lost'),
			rucksack = require('rucksack-css'),
			// 整個sass資料夾import
			bulkSass = require('gulp-sass-bulk-import'),
			// markdown
			markdown = require('gulp-markdown'),
			// ES6
			babel = require("gulp-babel"),
			browserify = require('browserify'),
			babelify = require('babelify'),
			source = require('vinyl-source-stream'),
			// ES6後壓縮
			buffer = require('vinyl-buffer'),
			uglify = require('gulp-uglify'),
			// 編譯riot.js
			riot = require('gulp-riot'),
			// 壓縮css
			minifyCSS = require('gulp-minify-css'),
			// 重新命名min檔用
			rename = require("gulp-rename"),
			// 偵錯工具
			plumber = require('gulp-plumber'),
			notify = require("gulp-notify"),
			// sourcemap
			sourcemaps = require('gulp-sourcemaps'),
			// bundle
			bundle = require('gulp-bundle-assets'),
			// webServer
			webServer = require('gulp-webserver');

// 路徑
const src_Pug = './pug/*.pug',
			end_Pug = './',
			src_sass = ['./assets/sass/**/*.sass', './assets/sass/**/*.scss'],
			end_Sass = './assets/css/';

// webServer網址
const serverSite = 'seansu.local';

// sass編譯css的排列
/*
	nested: 一般css，但尾巴在同一行
	expanded: 完整的css排列
	compact: 每一段變成一行
	compressed: 壓縮成一行
*/
const sassCompile = 'compact';

// gulp.task('clean', () => del(['./assets/bundle/*']));

// Pug
gulp.task('template', () => {
	return gulp.src(src_Pug)
	.pipe(plumber({
		errorHandler: notify.onError("Error: <%= error.message %>")
	}))
	.pipe(pug({
		pretty: true
	}))
	.pipe(gulp.dest(end_Pug))
	.pipe(notify({
		message: 'Pug Compily'
	}));
});


// 讓sass可以import css
gulp.task('css', () => {
	gulp.src('assets/vendor/**/*.css')
		.pipe(importCss())
		.pipe(gulp.dest(end_Sass));
});


// postCss
gulp.task('styles', () => {
	var processors = [
		lost,
		rucksack({
			fallbacks: true
		}),
		autoprefixer({
			browsers: ['last 4 version']
		})
	];
	return gulp.src(src_sass)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(sourcemaps.init())
		.pipe(bulkSass())
		.pipe(sass({
			outputStyle: sassCompile
		}).on('error', sass.logError))
		.pipe(postcss(processors))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(end_Sass));
});



// 監聽
gulp.task('watch', () => {
	gulp.watch(src_Pug, ['template']);
	gulp.watch(src_sass, ['styles']);
});


// server
gulp.task('webServer', () => {
	gulp.src('./')
		.pipe(webServer({
			host: serverSite,
			fallback: 'index.html',
			livereload: true
		}));
});


// cmd輸入"gulp"時，要執行的task
gulp.task('default', ['template', 'styles', 'webServer', 'watch']);