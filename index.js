const im = require('imagemagick');
const RSVP = require('rsvp');
const Promise = RSVP.Promise;
const _ = require('lodash');

const defaults = require('./lib/defaults');

// const crypto = require('crypto');
// crypto.createHash('sha256').update('Apple').digest('hex');

const identify = RSVP.denodeify(im.identify);
const resize = RSVP.denodeify(im.resize);

function ResponsiveImageConverter(config) {
  this.config = _.defaultsDeep({}, config, defaults);
}

ResponsiveImageConverter.prototype = {
  constructor: ResponsiveImageConverter,

  generateSrcset: function(path, sizesConfig) {
    return this._identify(path)
      .then(features => features.width)
      .then(this._generateWidths.bind(this))
      .then(this._resizeImageForWidths.bind(this, path))
      .then(this._generateAttributesForImages.bind(this, path, sizesConfig))
  },

  _generateWidths: function(max) {
    const min = this.config.minWidth;
    const steps = this.config.steps;

    const range = max - min;
    const step = Math.floor(range / steps);
    return Array.from({ length: steps }).map(function(value, index) {
      return min + (index * step);
    });
  },

  _resizeImageForWidths: function(path, widths)  {
    return Promise.all(widths.map(width => {
      const pathParts = path.split('.');
      const pathStart = pathParts[0];
      const extension = pathParts[1];

      return this._resize({
        srcPath: path,
        dstPath: `${pathStart}-${width}.${extension}`,
        width: width,
      }).then(function(){
        return {
          dstPath: `${pathStart}-${width}.${extension}`,
          width: width,
        }
      });
    }));
  },

  _generateAttributesForImages: function(path, sizesConfig, images)  {
    const srcset = images.reduce(function(memo, image) {
      return memo.concat(`${image.dstPath} ${image.width}w`);
    }, []);

    const breakpoints = this.config.breakpoints;
    const sizes = Object.keys(sizesConfig)
    // Default is always last
            .filter(key => key !== 'default')
            .reduce(
              (memo, key) => memo.concat(`${breakpoints[key]} ${sizesConfig[key]}`),
              []);

    // Add the default size to the end of the array without a
    // media query prefix.
    if (sizesConfig.default) {
      sizes.push(sizesConfig.default);
    }

    const attributes = {
      src: path,
      sizes: sizes.join(', ') || '100vw',
      srcset: srcset.join(', ')
    };
    return attributes;
  },

  _identify: identify,
  _resize: resize,
};

module.exports = ResponsiveImageConverter;
