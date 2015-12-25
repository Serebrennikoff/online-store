var gulp = require("gulp"),
  wiredep = require('wiredep').stream,
  plumber = require('gulp-plumber'),
  autoprefixer = require('gulp-autoprefixer'),
  jade = require('gulp-jade'),
  browserSync = require('browser-sync'),
  sass = require('gulp-sass'),
  uncss = require('gulp-uncss'),
  paths = {
    jade:['app/**/*.jade'],
    sass:['app/**/*.sass']
  };

// сборка html css javascript + удаление папки dist
var rimraf = require('gulp-rimraf'),    
    useref = require('gulp-useref'),    
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'), 
    minifyCss = require('gulp-minify-css');

// финальная сборка
var filter = require('gulp-filter'), 
    imagemin = require('gulp-imagemin'),
    size = require('gulp-size');

// Перенос шрифтов
    gulp.task('fonts', function() {
      gulp.src('app/fonts/*')
        .pipe(filter(['*.eot','*.svg','*.ttf','*.woff','*.woff2']))
        .pipe(gulp.dest('dist/fonts/'))
    });

// Остальные файлы, такие как favicon.ico и пр.
    gulp.task('extras', function () {
      return gulp.src([
        'app/*.*',
        '!app/*.html'
      ]).pipe(gulp.dest('dist'));
    });

// Картинки
    gulp.task('images', function () {
      return gulp.src('app/img/**/*')
        .pipe(imagemin({
          progressive: true,
          interlaced: true
        }))
        .pipe(gulp.dest('dist/img'));
    });

// Следим за bower
  gulp.task('wiredep', function () {
    gulp.src('app/*.html')
      .pipe(wiredep())
      .pipe(gulp.dest('app/'))
  });

  // Компиляция jade
  gulp.task('jade', function () {
    gulp.src(paths.jade)
      .pipe(plumber())
      .pipe(jade({pretty:true}))
      .pipe(gulp.dest('app/'));
  });

  // Компиляция sass
  gulp.task('sass', function () {
    gulp.src(paths.sass)
      .pipe(plumber())
      .pipe(sass({outputStyle:'compressed'}))
      .pipe(autoprefixer())
      .pipe(uncss({
        html: ['app/**/*.html']
      }))
      .pipe(gulp.dest('app/css/'));
  });

  gulp.task('server', function () {
    browserSync({
      port: 9000,
      server: {
        baseDir: 'app'
      }
    });
  });

  gulp.task('watch', function() {
    gulp.watch([
      'app/*.html',
      'app/js/**/*.js',
      'app/css/**/*.css'
    ]).on('change', browserSync.reload);
    gulp.watch('bower.json', ['wiredep']);
    gulp.watch(paths.jade, ['jade']);
    gulp.watch(paths.sass, ['sass']);
  });

  gulp.task('default', ['server', 'watch']);

  // Переносим HTML, CSS, JS в папку dist 
  gulp.task('useref', function () {
    return gulp.src('app/*.html')
      .pipe(useref())
      .pipe(gulpif('*.js', uglify()))
      .pipe(gulpif('*.css', minifyCss({compatibility: 'ie8'})))
      .pipe(gulp.dest('dist'));
  });

  // Очистка
    gulp.task('clean', function() {
      return gulp.src('dist', { read: false }) 
        .pipe(rimraf());
    });

    // Сборка и вывод размера содержимого папки dist
gulp.task('dist', ['useref', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe(size({title: 'build'}));
});

// Собираем папку DIST (только после компиляции Jade)
gulp.task('build', ['clean'], function () {
  gulp.start('dist');
});