const mode = 'development';

// modules

const sourceFolder = 'src',
      distFolder = 'dist';

const path = {
  src: {
    html: sourceFolder + '/*.html',
    sass: sourceFolder + '/scss/style.scss',
    css: sourceFolder + '/css/**/*.css',
    js: sourceFolder + '/js/index.js',
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
};

const jsConcat = [
  sourceFolder + '/js/lite-yt-embed.js',
  sourceFolder + '/js/jquery.js',
  sourceFolder + '/js/svgxuse.min.js',
  sourceFolder + '/js/index.js'
];

// dependencies
const gulp = require('gulp'),
      browserSync = require('browser-sync').create(),
      sourcemaps = require('gulp-sourcemaps'),
      sass = require('gulp-sass')(require('sass')),
      del = require('del'),
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
      mediaQueries = require('gulp-group-css-media-queries'),
      webpack = require('webpack'),
      gulpWebpack = require('webpack-stream');

// Tasks

function pugBuild() {
  return gulp.src(path.src.pug)
    .pipe(
      pug({
        pretty: true
      })
    )
    .pipe(htmlhint())
    .pipe(gulp.dest(path.dist.html))
    .pipe(browserSync.stream())
}

function scss() {
  let processor = [autoprefixer('last 2 versions')]
  return gulp.src(path.src.sass)
          .pipe(sourcemaps.init())
          .pipe(postcss([stylelint()]))
          .pipe(sass({
            outputStyle: 'expanded'
          }).on('error', sass.logError))
          .pipe(sourcemaps.write())
          .pipe(postcss(processor))
          .pipe(gulp.dest(path.dist.css))
          .pipe(browserSync.stream())
    
}

function scssProd() {
  let processor = [autoprefixer('last 2 versions')]
  let processorMin = [autoprefixer('last 2 versions'), cssnano()]

  return gulp.src(path.src.sass)
          .pipe(sass({
            outputStyle: 'expanded'
          }).on('error', sass.logError))
          .pipe(postcss(processor))
          .pipe(mediaQueries())
          .pipe(gulp.dest(path.dist.css))
          .pipe(gulp.src(path.src.sass))
          .pipe(sass({
            outputStyle: 'expanded'
          }).on('error', sass.logError))
          .pipe(mediaQueries())
          .pipe(postcss(processorMin))
          .pipe(rename({
            extname: '.min.css'
          }))
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
          .pipe(gulpWebpack(require('./webpack.config.js'), webpack))
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
  if (mode === 'development') {
    gulp.watch([path.watch.sass], gulp.series(scss, linter));
  } else if(mode === 'production') {
    gulp.watch([path.watch.sass], gulp.series(scssProd));
  }
  gulp.watch([path.watch.img], gulp.series(img, img2webp));
  gulp.watch([path.watch.sprite], gulp.series(sprite));
  gulp.watch([path.watch.fonts], gulp.parallel(toWoff, toWoff2));
}

function clean() {
  return del('./' + distFolder)
}

let dev = gulp.series(clean, gulp.parallel(pugBuild, css, scss, js, gulp.series(img, img2webp, sprite), toWoff, toWoff2), linter);
let prod = gulp.series(clean, gulp.parallel(pugBuild, css, scssProd, js, gulp.series(img, img2webp, sprite), toWoff, toWoff2));

exports.dev = gulp.series(dev, gulp.parallel(watcher, server));
exports.prod = gulp.series(prod, gulp.parallel(watcher, server));
exports.linter = gulp.series(linter);
exports.build = prod;
