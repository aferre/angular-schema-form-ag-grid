/* global require */

var gulp = require('gulp');
var webserver = require('gulp-webserver');

var templateCache = require('gulp-angular-templatecache');
var minifyHtml = require('gulp-minify-html');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var streamqueue = require('streamqueue');
var jscs = require('gulp-jscs');
var umd    = require('gulp-umd');

gulp.task('minify', function() {
  var stream = streamqueue({objectMode: true});

  stream.queue(
              gulp.src('./src/aggrid*.html')
                  .pipe(minifyHtml({
                    empty: true,
                    spare: true,
                    quotes: true
                  }))
                  .pipe(templateCache({
                    module: 'schemaForm',
                    root: 'directives/decorators/bootstrap/aggrid/'
                  }))
    );
  stream.queue(gulp.src('./src/*.js'));

  stream.done()
        .pipe(concat('angular-schema-form-ag-grid.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'));

});

gulp.task('non-minified-dist', function() {
  var stream = streamqueue({objectMode: true});
 
   stream.queue(
              gulp.src('./src/aggrid*.html')
                  .pipe(templateCache({
                    module: 'schemaForm',
                    root: 'directives/decorators/bootstrap/aggrid/'
                  }))
    );
  stream.queue(gulp.src('./src/*.js'));

  stream.done()
        .pipe(concat('angular-schema-form-ag-grid.js'))
        .pipe(gulp.dest('./dist/'));

});

gulp.task('jscs', function() {
  gulp.src('./src/**/*.js')
      .pipe(jscs());
});

gulp.task('default', [
  'minify',
  'non-minified-dist'
]);

gulp.task('watch', function() {
  gulp.watch('./src/**/*', ['default']);
});

gulp.task('webserver', function() {
  gulp.src('.')
    .pipe(webserver({
      livereload: true,
      port: 8001,
      open: true
    }));
});
