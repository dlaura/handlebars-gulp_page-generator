
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    hbsAll = require('gulp-handlebars-all'),
    ext_replace = require('gulp-ext-replace'),
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    minify = require('gulp-minifier'),
    combineMq = require('gulp-combine-mq'),
    htmlhint = require("gulp-htmlhint"),
    jshint = require('gulp-jshint'),
    csslint = require('gulp-csslint'),
    connect = require('gulp-connect');


gulp.task('compile', function() {
   gulp.src('src/template/pages/**/*.handlebars')
  .pipe(hbsAll('html', {
    context: {foo: 'bar'},
 
    partials: ['src/template/partials/*.handlebars'],

    // USE THIS LINE IF YOU HAVE SUBFOLDERS IN PARTIALS AND COMMENT OUT LINE ABOVE AND USE:
    //partials: ['src/template/partials/**/*.handlebars'],
 
    helpers: {
      capitals : function(str) {
        return str.toUpperCase();
      }
    }
  }))
  .pipe(ext_replace('.html'))
  .pipe(gulp.dest('release'))
  .pipe(connect.reload());
});



//Gulp task compile sass to minified css
gulp.task('sass', function () {
  return gulp.src('./src/scss/**/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS({debug: true}, function(details) {
        console.log(details.name + ': ' + details.stats.originalSize/1000 +' KB');
        console.log(details.name + ' minified: ' + details.stats.minifiedSize/1000 +' KB');
    }))
     .pipe(combineMq({
        beautify: false
    }))
    .pipe(gulp.dest('./release/css'))
    .pipe(connect.reload());
});


//Gulp task minify JS (removing only white spaces no code uglify)
gulp.task('minifyjs', function() {
  return gulp.src('./src/js/**/*.js').pipe(minify({
    minify: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyJS: true,
    getKeptComment: function (content, filePath) {
        var m = content.match(/\/\*!<%%>[\s\S]*?\*\//img);
        return m && m.join('\n') + '\n' || '';
    }
  })).pipe(gulp.dest('./release/js')) 
  .pipe(connect.reload());
});

//Copy images
gulp.task('images', function() {
    gulp.src('./src/images/**/*.*')
    .pipe(gulp.dest('./release/images'))
    .pipe(connect.reload());
});

//Copy data if needed
gulp.task('data', function() {
    gulp.src('./src/data/*.*')
    .pipe(gulp.dest('./release/data'))
    .pipe(connect.reload());
});

//Watch all the changes in SCSS JS Images and HANDLEBARS Files
gulp.task('watch', function () {
  gulp.watch('template/**/*.handlebars', {cwd: './src/'}, ['compile']);
  gulp.watch('images/**/*.*', {cwd: './src/'}, ['images']);
  gulp.watch('data/*.*', {cwd: './src/'}, ['data']);
  gulp.watch(['./src/scss/**/*.scss'], ['sass']);
  gulp.watch('js/**/*.js', {cwd: './src/'}, ['minifyjs']);
}); 


//Server and port  localhost:3000 in your browser
gulp.task('server', function(event) {
    connect.server({
        root: 'release',
        port: 3000,
        livereload: true
    });
});

//Testing and reporting
gulp.task('htmlhint', function () {
return gulp.src("./release/*.html")
    .pipe(htmlhint())
    .pipe(htmlhint.failReporter());
});

gulp.task('jslint', function() {
  return gulp.src('./src/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }));
});

gulp.task('csslint', function() {
  gulp.src('./release/css/*.css')
    .pipe(csslint())
    .pipe(csslint.formatter());
});

//Default task will build everything
gulp.task('default', ['sass', 'compile', 'images', 'minifyjs', 'data', 'server', 'watch']);

//Testing page for html errors, add the other tasks if needed
gulp.task('test', ['htmlhint']);

