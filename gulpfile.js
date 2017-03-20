var gulp = require('gulp'); //required node gulp module
var sass = require('gulp-sass'); //required node sass module
var browserSync = require('browser-sync').create(); //required node browser live refresh module
var exec = require('gulp-exec'); // to create starting folder structure

//for optimization of final build
var useref = require('gulp-useref'); //concatenate js files into single bundle file 
var uglify = require('gulp-uglify'); // minified js files
var gulpIf = require('gulp-if'); // check for js files
var cssnano = require('gulp-cssnano'); //minified css files
var imagemin = require('gulp-imagemin'); //optimize images png, jpg, gif and svg
var del = require('del'); //delete all files from target folder
var runSequence = require('run-sequence'); // to make sure all task runs in sequence



var sassFiles = 'app/scss/*.scss'; //add files path to variable 

gulp.task('sass', function(){
    return gulp.src(sassFiles)
            .pipe(sass()) // using gulp sass
            .pipe(gulp.dest('app/css'))
            .pipe(browserSync.reload({
                stream:true
    }))
})

gulp.task('browserSync',function(){
    browserSync.init({
        server:{
            baseDir:'app'
        }
    })
})

gulp.task('watch',['browserSync','sass'],function(){
    gulp.watch(sassFiles,['sass']);
    
    //Reloads the browser when HTML or JS files are changes
    gulp.watch('app/*.html',browserSync.reload);
    gulp.watch('app/js/*.js', browserSync.reload)
})

gulp.task('default', function (callback) {
  runSequence(['sass','browserSync', 'watch'],
    callback
  )
})

//////optimization//////

gulp.task('useref',function(){
    return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))//Minify only if its javascript file
        .pipe(gulpIf('*.css', cssnano()))//Minify only if its css file
        .pipe(gulp.dest('dist'))
        
})


gulp.task('images',function(){
    return gulp.src('app/images/**.*')//gulp.src('app/images/**/*.+[png|jpg|gif|svg]')
            .pipe(imagemin([imagemin.gifsicle({quality: '65-80'}), imagemin.jpegtran({quality: '65-80'}), imagemin.optipng({quality: '65-80'}), imagemin.svgo({quality: '65-80'})],
            {
              // Setting interlaced to true
              interlaced: true
            }))
            .pipe(gulp.dest('dist/images'))
})


gulp.task('fonts', function() { //copy fonts from app to dist
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
})

gulp.task('vendor', function() { //copy frontend libraries from app/vendor to dist/vendor
  return gulp.src('app/vendor/**/*')
  .pipe(gulp.dest('dist/vendor'))
})

gulp.task('clean:dist', function() { //delete dist sub folders
  return del.sync('dist');
})


gulp.task('build', function (callback) {
  runSequence('clean:dist', 
    ['sass', 'useref', 'images', 'fonts', 'vendor'],
    callback
  )
})

////////make structure/////////
gulp.task('mkstr',function(){ //create basic structure for start building your app
    
  return gulp.src('./')
    .pipe(exec('md app\\sass app\\css app\\js app\\images app\\vendor'))
    .pipe(exec('echo >app\\index.html'))
    .pipe(exec('echo this folder for add all thrid party tools like jQuery, bootstrap, fontawesome etc  >app\\vendor\\readme.txt'))
    .pipe(exec('md dist\\css dist\\js dist\\images'))
    
})

gulp.task('mkhtm',function(){ //create basic structure index.html page with all linking
    var options = {
        continueOnError: false, // default = false, true means don't emit error event
        pipeStdout: false, // default = false, true means stdout is written to file.contents
        sampleHtm: '^<!DOCTYPE html^>^<html lang="en"^>^<head^>^<meta charset="UTF-8"^>^<title^>Sample HTML^</title^>^<link href="../vendor/bootstrap/dist/css/bootstrap.min.css" type="text/css" media="all"^>^<link href="../vendor/font-awesome/css/font-awesome.min.css" type="text/css" media="all"^>^<link href="css/style.css" type="text/css" media="all"^>^</head^>^<body^>^<script type="text/javascript" src="../vendor/jquery/dist/jquery.min.js"^>^</script^>^<script type="text/javascript" src="../vendor/bootstrap/dist/js/bootstrap.min.js"^>^</script^>^</body^>^</html^>',
        customTemplatingThing: "test" // content passed to gutil.template()
      };
  return gulp.src('./')
    .pipe(exec('echo <%= options.sampleHtm %> >app\\index.html',options))
 
    
 
})
