// modules

// Конфигурация
const mode = 'development';

const sourceFolder = 'src',
      distFolder = 'dist';

const path = {
  src: {
    html: sourceFolder + '/*.html',
    sass: sourceFolder + '/scss/style.scss',
    css: sourceFolder + '/css/**/*.css',
    js: sourceFolder + '/js/**/*.js',
    img: sourceFolder + '/img/**/*.{jpg,png,webp,svg,ico,gif}',
    icons: sourceFolder + '/img/icons/**/*.svg',
    fonts: sourceFolder + '/fonts/**/*.{woff,woff2}',
    pug: sourceFolder + '/pug/*.pug'
  },
  dist: {
    html: distFolder,
    css: distFolder + '/css',
    js: distFolder + '/js',
    img: distFolder + '/img',
    icons: distFolder + '/img/sprite.svg',
    fonts: distFolder + '/fonts'
  },
  watch: {
    html: sourceFolder + '/*.html',
    pug: sourceFolder + '/pug/**/*.pug',
    css: sourceFolder + '/css/**/*.css',
    sass: sourceFolder + '/scss/**/*.scss',
    js: sourceFolder + '/js/**/*.js',
    img: sourceFolder + '/img/**/*.{jpg,png,webp,svg,ico,gif}',
    sprite: sourceFolder + '/img/icons/**/*.svg',
    fonts: sourceFolder + '/fonts/**/*.{woff,woff2}'
  }
}

// dependencies
const gulp = require('gulp'),
      browserSync = require('browser-sync').create(),
      sourcemaps = require('gulp-sourcemaps'),
      sass = require('gulp-sass')(require('sass')),
      del = require('del'),
      uglify = require('gulp-uglify-es').default,
      babel = require("gulp-babel"),
      rename = require('gulp-rename'),
      imagemin = require('gulp-imagemin'),
      webp = require('gulp-webp'),
      fonter = require('gulp-fonter'),
      ttf2woff2 = require('gulp-ttf2woff2'),
      svgSprite = require('gulp-svg-sprite'),
      cheerio = require('gulp-cheerio'),
      postcss = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      cssnano = require('cssnano'),
      pug = require('gulp-pug'),
      stylelint = require('stylelint'),
      reporter = require('postcss-reporter'),
      mediaQueries = require('gulp-group-css-media-queries');

// Tasks

function pugBuild() {
  return gulp.src(path.src.pug)
    .pipe(
      pug({
        pretty: true
      })
    )
    .pipe(gulp.dest(path.dist.html))
    .pipe(browserSync.stream())
}

function scss() {
  let processor = [autoprefixer('last 2 versions')]
  if (mode === 'production') {
    processor.push(cssnano())
  }
  return gulp.src(path.src.sass)
          .pipe(sourcemaps.init())
          .pipe(postcss([stylelint()]))
          .pipe(sass({
            outputStyle: 'expanded'
          }).on('error', sass.logError))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest(path.dist.css))
          .pipe(browserSync.stream())
    
}

function scssProduction() {
  let processor = [autoprefixer('last 2 versions')]

  return gulp.src(path.src.sass)
          .pipe(sass({
            outputStyle: 'expanded'
          }).on('error', sass.logError))
          .pipe(postcss(processor))
          .pipe(mediaQueries())
          .pipe(gulp.dest(path.dist.css))
          .pipe(gulp.src(path.dist.css + '/style.css'))
          .pipe(rename('style.min.css'))
          .pipe(gulp.dest(path.dist.css))
          .pipe(browserSync.stream());
}

function linter() {
  let processor = [
      stylelint(require('./.stylelintrc.js')),
      reporter({
        clearReportedMessages: true
      })
    ];

  return gulp.src(path.src.sass)
          .pipe(postcss(processor))

}

function css() {
  return gulp.src(path.src.css)
          .pipe(gulp.dest(path.dist.css))
          .pipe(browserSync.stream());
}

function js() {
    return gulp.src(path.src.js)
            .pipe(babel({
              presets: ["@babel/preset-env"]
            }))
            .pipe(gulp.dest(path.dist.js))
            .pipe(browserSync.stream());
      
}

function jsProduction() {
  return gulp.src(path.src.js)
          .pipe(babel({
              presets: ["@babel/preset-env"]
            }))
          .pipe(uglify())
          .pipe(rename({extname: '.min.js'}))
          .pipe(gulp.dest(path.dist.js))
          .pipe(browserSync.stream());
}

function img() {
  return gulp.src(path.src.img)
          .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
              plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
              ]
            })
          ]))
          .pipe(gulp.dest(path.dist.img))
          .pipe(browserSync.stream());
}

function img2webp() {
  return gulp.src(distFolder + '/img/**/*.{png,jpg}')
          .pipe(webp({quality: 75}))
          .pipe(gulp.dest(path.dist.img))
          .pipe(browserSync.stream());
}

function sprite() {
  return gulp.src(path.src.icons)
    .pipe(cheerio(
      function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      }
    ))
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            sprite: 'sprite.svg'
          }
        }
      })
    )
    .pipe(gulp.dest(path.dist.img))
    .pipe(browserSync.stream());
}

function toWoff() {
  return gulp.src(sourceFolder + '/fonts/**/*.{ttf,otf}')
    .pipe(fonter({
      formats: ['woff']
    }))
    .pipe(gulp.dest(path.dist.fonts))
    .pipe(browserSync.stream());
}

function toWoff2() {
  return gulp.src(sourceFolder + '/fonts/**/*.ttf')
    .pipe(ttf2woff2())
    .pipe(gulp.dest(path.dist.fonts))
    .pipe(browserSync.stream());
}

function server() {
  browserSync.init({
    server: {
      baseDir: './' + distFolder
    },
    notify: false,
    port: 9000
  })
}

function watcher() {
  gulp.watch([path.watch.pug], gulp.series(pugBuild));
  gulp.watch([path.watch.css], gulp.series(css));
  gulp.watch([path.watch.sass], gulp.series(scss, linter));
  gulp.watch([path.watch.js], gulp.series(js));
  gulp.watch([path.watch.img], gulp.series(img, img2webp));
  gulp.watch([path.watch.sprite], gulp.series(sprite));
  gulp.watch([path.watch.fonts], gulp.parallel(toWoff, toWoff2));
}

function clean() {
  return del('./' + distFolder)
}

let buildDev = gulp.series(clean, gulp.parallel(pugBuild, css, scss, js, gulp.series(img, img2webp, sprite), toWoff, toWoff2), linter);
let buildProd = gulp.series(clean, gulp.parallel(pugBuild, css, scssProduction, jsProduction, gulp.series(img, img2webp, sprite), toWoff, toWoff2), linter);

exports.dev = gulp.series(buildDev, gulp.parallel(watcher, server));
exports.prod = gulp.series(buildProd, gulp.parallel(watcher, server));
exports.linter = gulp.series(linter);