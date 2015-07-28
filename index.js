'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var objectAssign = require('object-assign');
var file = require('vinyl-file');
var sortKeys = require('sort-keys');

function relPath(base, filePath) {
	if (filePath.indexOf(base) !== 0) {
		return filePath.replace(/\\/g, '/');
	}

	var newPath = filePath.substr(base.length).replace(/\\/g, '/');

	if (newPath[0] === '/') {
		return newPath.substr(1);
	}

	return newPath;
}

function getManifestFile(opts, cb) {
	file.read(opts.path, opts, function (err, manifest) {
		if (err) {
			// not found
			if (err.code === 'ENOENT') {
				cb(null, new gutil.File(opts));
			} else {
				cb(err);
			}

			return;
		}

		cb(null, manifest);
	});
}

var manifest = function (pth, opts) {
	if (typeof pth === 'string') {
		pth = {path: pth};
	}

	opts = objectAssign({
		path: 'manifest.json',
		merge: false
	}, opts, pth);

	var firstFileBase = null;
	var manifest = {};
	manifest.files = {};
	manifest.assets = {};

	return through.obj(function (file, enc, cb) {
		// ignore all non-rev'd files
		if (!file.path || !file.revOrigPath) {
			cb();
			return;
		}

		firstFileBase = firstFileBase || file.base;

		var revisionedFile = relPath(firstFileBase, file.path);
		var originalFile = path.join(path.dirname(revisionedFile), path.basename(file.revOrigPath)).replace(/\\/g, '/');

		manifest.assets[originalFile] = revisionedFile;
		manifest.files[revisionedFile] = {
			"logical_path": originalFile,
			"mtime": file.stat.mtime,
			"size": file.contents.length,
			"digest": file.revHash
		};

		cb();
	}, function (cb) {
		// no need to write a manifest file if there's nothing to manifest
		if (Object.keys(manifest).length === 0) {
			cb();
			return;
		}

		getManifestFile(opts, function (err, manifestFile) {
			if (err) {
				cb(err);
				return;
			}

			if (opts.merge && !manifestFile.isNull()) {
				var oldManifest = {};

				try {
					oldManifest = JSON.parse(manifestFile.contents.toString());
				} catch (err) {}

				manifest = objectAssign(oldManifest, manifest);
			}

			manifestFile.contents = new Buffer(JSON.stringify(sortKeys(manifest), null, '  '));
			this.push(manifestFile);
			cb();
		}.bind(this));
	});
};

module.exports = manifest;
