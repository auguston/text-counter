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
			end_Sass = './assets/css/',
			// end_bundle = './assets/bundle/',
			// src_mark = './*.md',
			// end_mark = './',
			// src_riot = './assets/riot/tag/*.tag',
			// end_riot = './assets/riot/js/',
			src_es6js = './assets/js/main.js',
			end_es6js = './assets/js/';

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

// ES6
gulp.task('es6', () => {
  return browserify({
		// 要編譯哪些檔案
    entries: [src_es6js]
  })
    .transform(babelify.configure({
      presets : ['es2015']
    }))
    .bundle()
    // bundle 後的檔案名稱
		.pipe(source('main.min.js'))
		// 壓縮檔案
		.pipe(buffer())
		.pipe(uglify())
		// bundle 完的檔案要放哪
    .pipe(gulp.dest(end_es6js));
});

// 編譯riot.js
// gulp.task('riot', () => {
// 	gulp.src(src_riot)
// 		.pipe(riot({
// 			compact: true
// 		}))
// 		.pipe(gulp.dest(end_riot));
// });


// 合併、壓縮js檔案
// gulp.task('bundle', () => {
// 	return gulp.src('./bundle.config.js')
// 		.pipe(bundle())
// 		/*
// 			想重新更名的話可以使用下列語法，但要記得 .js.map 的檔名要改
// 			.pipe(rename(function(path) {
// 				path.basename += "-multimedia.min";
// 				path.extname = ".js";
// 			}))
// 		*/
// 		.pipe(gulp.dest(end_bundle))
// 		.pipe(notify({
// 			message: 'Bundle Compily'
// 		}));
// });


// markdown，需要時在拿掉註解
// gulp.task('markdown', () => {
//   return gulp.src(src_mark)
//     .pipe(plumber({
//       errorHandler: notify.onError("Error: <%= error.message %>")
//     }))
//     .pipe(markdown())
//     .pipe(gulp.dest(end_mark))
//     .pipe(notify({
//       message: 'Markdown Success'
//     }));
// });


// 監聽
gulp.task('watch', () => {
	// gulp.watch(['./assets/js/*.js', './assets/css/*.css'], ['clean']); // 每次都clean會花時間
	gulp.watch(src_Pug, ['template']);
	gulp.watch(src_sass, ['styles']);
	gulp.watch('./assets/js/*.js', ['es6']);
	// gulp.watch(src_riot, ['riot']);
	// gulp.watch(['./bundle.config.js', './assets/js/*.js', './assets/css/*.css'], ['bundle']);
	// gulp.watch(src_mark, ['markdown']);
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
gulp.task('default', ['template', 'styles', 'es6', 'webServer', 'watch']);