# gulp-rev-manifest-rails

> Builds a rev manifest file that is compatible with Rails. Forked from the manifest function of gulp-rev

`gulp-rev-manifest-rails` sits downstream of `gulp-rev` and generates a rails compatible version of the manifest.

This plugin is a modified version of the `gulp-rev` manifest function and takes all the same options.

## Install

```
$ npm install --save-dev gulp-rev-manifest-rails
```

## Usage

```js
var gulp = require('gulp');
var rev = require('gulp-rev');
var revManifestRails = require('gulp-rev-manifest-rails');

gulp.task('default', function () {
	return gulp.src('src/*.css')
		.pipe(rev())
		.pipe(gulp.dest('dist'))
		.pipe(revManifestRails())
		.pipe(gulp.dest('dist'));
});
```
