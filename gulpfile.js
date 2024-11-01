/**
 * Gulp Tasks
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

const gulp = require('gulp')
const del = require('del')
const $ = require('gulp-load-plugins')()
const log = require('fancy-log')
const colors = require('ansi-colors')
const webpack = require('webpack')
const webpackStream = require('webpack-stream')
const webpackConfig = require('./webpack.config.js')
const sentryWebpackPlugin = require("@sentry/webpack-plugin")
const postfix = (new Date()).getTime().toString()

let ENVIRONMENT = 'development'
let WEBPACK_NEED_WATCH = false

/**
 * Compile Style & Script
 */
function handleCompileError(event) {
    log.error(colors.red(event.message), 'error.')
}

function compileWebpack(callback) {
    webpackConfig.mode = ENVIRONMENT
    webpackConfig.plugins = webpackConfig.plugins || []
    webpackConfig.plugins.push(new webpack.DefinePlugin({
        'process.env': {
            'ENV': JSON.stringify(ENVIRONMENT),
            'BUILD_TIME': postfix,
            'NODE_ENV': JSON.stringify(ENVIRONMENT)
        }
    }))

    if ('production' === ENVIRONMENT) {
        webpackConfig.plugins.push(new sentryWebpackPlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: "scarstudio",
            project: "mhrc",
            release: postfix,
            include: "src/boot"
        }))
    }

    if (WEBPACK_NEED_WATCH) {
        webpackConfig.watch = true
    }

    let result = gulp.src([ 'src/scripts/main.jsx', 'src/scripts/worker.js' ])
        .pipe(webpackStream(webpackConfig, webpack).on('error', handleCompileError))
        .pipe(gulp.dest('src/boot'))

    if (WEBPACK_NEED_WATCH) {
        callback()
    } else {
        return result
    }
}

/**
 * Copy Files & Folders
 */
function copyStatic() {
    return gulp.src('src/static/**/*')
        .pipe(gulp.dest('src/boot'))
}

function copyVendorFonts() {
    return gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/*.{otf,eot,svg,ttf,woff,woff2}')
        .pipe(gulp.dest('src/fonts/vendor'))
}

/**
 * Watching Files
 */
function watch() {

    // Watch Files
    gulp.watch('src/boot/**/*').on('change', $.livereload.changed)
    gulp.watch('src/static/**/*', copyStatic)

    // Start LiveReload
    $.livereload.listen({
        host: '0.0.0.0'
    })
}

/**
 * Release
 */
function releaseCopyBoot() {
    return gulp.src('src/boot/**/*')
        .pipe($.filter(['**', '!**/*.map']))
        .pipe(gulp.dest('docs'))
}

function releaseReplaceIndex() {
    return gulp.src('src/boot/index.html')
        .pipe($.replace('?timestamp', `?${postfix}`))
        .pipe(gulp.dest('src/boot'))
}

/**
 * Set Variables
 */
function setEnv(callback) {

    // Warrning: Change ENVIRONMENT to Prodctuion
    ENVIRONMENT = 'production'

    callback()
}

function setWatch(callback) {

    // Webpack need watch
    WEBPACK_NEED_WATCH = true

    callback()
}

/**
 * Clean Temp Folders
 */
function cleanBoot() {
    return del('src/boot')
}

function cleanDocs() {
    return del('docs')
}

/**
 * Bundled Tasks
 */
gulp.task('prepare', gulp.series(
    cleanBoot,
    gulp.parallel(copyStatic, copyVendorFonts),
    compileWebpack
))

gulp.task('release', gulp.series(
    setEnv, cleanDocs,
    'prepare', releaseReplaceIndex,
    releaseCopyBoot
))

gulp.task('default', gulp.series(
    setWatch,
    'prepare',
    watch
))
