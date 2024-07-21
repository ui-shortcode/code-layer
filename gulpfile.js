const gulp = require("gulp");
const { parallel, series } = require("gulp");

const imagemin = require("gulp-imagemin");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob-use-forward');
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create(); //https://browsersync.io/docs/gulp#page-top
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const ejs = require('gulp-ejs');
const del = require('del');
const plumber = require('gulp-plumber');
const prettify = require('gulp-prettify');

// /*
// TOP LEVEL FUNCTIONS
//     gulp.task = Define tasks
//     gulp.src = Point to files to use
//     gulp.dest = Points to the folder to output
//     gulp.watch = Watch files and folders for changes
// */

// Optimise Images
function imageMin(cb) {
    gulp.src("src/assets/img/**/*")
        .pipe(plumber())
        .pipe(imagemin())
        .pipe(gulp.dest("dist/assets/img"));
    cb();
}

// Copy all HTML files to Dist
function copyHTML(cb) {
    gulp.src("src/pages/*.html")
        .pipe(plumber())
        .pipe(gulp.dest("dist/html"));
    cb();
}

// Minify HTML
function minifyHTML(cb) {
    gulp.src("src/*.html")
        .pipe(plumber())
        .pipe(gulp.dest("dist"))
        .pipe(
            htmlmin({
                collapseWhitespace: true
            })
        )
        .pipe(gulp.dest("dist"));
    cb();
}

// Scripts
function js(cb) {
    gulp.src("src/assets/js/*.js")
        .pipe(plumber())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        // .pipe(concat("ui.js"))
        // .pipe(uglify())
        .pipe(gulp.dest("dist/assets/js"));
    cb();
}

// Compile Sass
function css(cb) {
    gulp.src(["src/assets/scss/*.scss", "src/components/**/*.scss"])
        .pipe(plumber())
        .pipe(sassGlob())
        // .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
        .pipe(sass({
            outputStyle: 'expanded',
            indentType: 'space',
            indentWidth: 2,
            includePaths: ['./node_modules'],
            charset: false
        }).on("error", sass.logError))
        .pipe(autoprefixer({
            browserlist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest("dist/assets/css"))
        // Stream changes to all browsers
        .pipe(browserSync.stream());
    cb();
}

// Process EJS
function ejsTask(cb) {
    gulp.src(["src/pages/*.html", "src/components/**/*.html"])
        .pipe(plumber())
        .pipe(ejs({}, {}, { async: true }))
        .pipe(prettify({ indent_size: 4, unformatted: ['pre', 'code'] }))
        .pipe(gulp.dest("dist/html"));
    cb();
}

// Process copyFonts
function copyFonts(cb) {
    gulp.src("src/assets/fonts/**/*.woff")
        .pipe(plumber())
        .pipe(gulp.dest("dist/assets/fonts"));
    cb();
}

// clean dist
async function cleanDist(cb) {
    await del('dist', { force: true });
    cb();
}

// Watch Files
function watch_files() {
    browserSync.init({
        server: {
            baseDir: "dist/",
            directory: true
        }
    });
    
    gulp.watch("src/assets/img/**/*", imageMin);
    gulp.watch("src/assets/fonts/**/*.woff", copyFonts);
    gulp.watch("src/assets/scss/**/*.scss", css);
    gulp.watch("src/components/**/*.scss", css);
    gulp.watch("src/assets/js/*.js", js).on("change", browserSync.reload);
    gulp.watch("src/components/**/*.html", ejsTask).on("change", browserSync.reload);
    gulp.watch("src/components/**/*.ejs", ejsTask).on("change", browserSync.reload);
    gulp.watch("src/pages/*.html", ejsTask).on("change", browserSync.reload);
    gulp.watch("src/00_include/**/*.html", ejsTask).on("change", browserSync.reload);
}

// Default 'gulp' command with start local server and watch files for changes.
exports.default = series(cleanDist, ejsTask, css, js, imageMin, copyFonts, watch_files);

// 'gulp build' will build all assets but not run on a local server.
exports.build = parallel(cleanDist, ejsTask, css, js, copyFonts, imageMin);
