var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');
var streamqueue = require('streamqueue');
var gulp = require('gulp');
var cssMin = require('gulp-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var strip = require('gulp-strip-comments');
var clean = require('gulp-remove-empty-lines');
var static = require('node-static');
var header = require('gulp-header');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');

function getFolders(dir) {
  return fs.readdirSync(dir)
  .filter(function(file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

function minifyJs(srcList,filename){

  gulp.src(srcList)
    .pipe(sourcemaps.init())
    .pipe(concat(filename+'.js'))
    .pipe(uglify().on('error', function(e){
            console.log(e);
         }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./js'));
    
}
function joinJs(srcList,filename){

  gulp.src(srcList)
    .pipe(sourcemaps.init())
    .pipe(concat(filename+'.js'))
    .pipe(gulp.dest('./js'));
    
}

gulp.task('serve',function () {
  var file = new static.Server({cache:-1});
  require('http').createServer(function (request, response) {
   request.addListener('end', function () {

    if(request.url.indexOf('.')>-1){
      if(request.url.indexOf('test') > -1) request.url = request.url.slice(11);
      file.serve(request, response);
    }
    else{
      file.serveFile('/index.html', 200, {}, request, response);
    }
  }).resume();
 }).listen(8082);
});

gulp.task('default', ['serve']);
