const path = require('path');
const fs = require('fs-extra');
const browserify = require('browserify');
const UglifyJS = require('uglify-js');
const babel = require('@babel/core');

/**
 * A class that is executed when node dependencies are installed.
 */
class ComponentPrepare {
  run() {
    return this.copyJexl();
  }

  nodeToBrowser(file) {
    return new Promise((resolve) => {
      const b = browserify();
      b.add(file);
      b.bundle((err, buf) => {
        if (err) {
          console.log(err);
        }
        resolve(buf.toString());
      });
    });
  }

  uglyContent(content) {
    const result = UglifyJS.minify(content, {
      compress: true
    });
    if (result.error) {
      throw result.error;
    }
    return result.code;
  }

  babelify(code) {
    return new Promise((resolve, reject) => {
      const cnf = {
        'presets': [[
          '@babel/preset-env'
        ]],
        'plugins': ['minify-mangle-names']
      };
      babel.transform(code, cnf, function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result.code);
        }
      });
    });
  }

  waitFor(stream) {
    return new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });
  }

  copyJexl() {
    const file = path.join('dev-lib', 'jexl-import.js');
    return this.nodeToBrowser(file)
    .then((code) => this.babelify(code))
    .then((content) => this.uglyContent(content))
    .then((content) => {
      const dest = path.join('dev-lib', 'jexl.min.js');
      return fs.writeFile(dest, content, 'utf8');
    });
  }
}

new ComponentPrepare().run();
