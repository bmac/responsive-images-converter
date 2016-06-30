const im = require('imagemagick');
const RSVP = require('rsvp');
const _ = require('lodash');

const defaults = require('./defaults');

// const crypto = require('crypto');
// crypto.createHash('sha256').update('Apple').digest('hex');

const identify = RSVP.denodeify(im.identify);
const resize = RSVP.denodeify(im.resize);

function ResponsiveImageConverter(config) {
  this.config = _.defaultsDeep({}, config, defaults);
}

ResponsiveImageConverter.prototype = {
  constructor: ResponsiveImageConverter,

  // resizeImageWithAttributes?
  // resizeImage
  resizeImage: function(path, sizesConfig) {
    return this._identify(path)
      .then(features => features.width)
      .then(this._targetWidthsForImages.bind(this))
      .then(this._resizeImageForWidths.bind(this, path))
      .then(this._attributesForImages.bind(this, path, sizesConfig))
  },

  _targetWidthsForImages: function(max) {
    const min = this.config.minWidth;
    const steps = this.config.steps;

    const range = max - min;
    const step = Math.floor(range / steps);
    return Array.from({ length: steps }).map(function(value, index) {
      return min + (index * step);
    });
  },

  _resizeImageForWidths: function(imagePath, widths)  {
    return Promise.all(widths.map(width => {
      const dstPath = this._disPathName(imagePath, width);

      return this._resize({
        srcPath: `${imagePath}`,
        dstPath: dstPath,
        width: width,
      }).then(function(){
        return {
          dstPath: dstPath,
          width: width,
        }
      });
    }));
  },

  _disPathName: function(imagePath, width) {
    const pathParts = imagePath.split('.');
    const pathStart = pathParts[0];
    const extension = pathParts[1];
    
    return `${pathStart}-${width}.${extension}`;
  },

  _attributesForImages: function(imagePath, sizesConfig, images)  {
    const srcset = this._srcset(images);
    const sizes = this._sizes(sizesConfig);
    const path = this.config.path;

    const attributes = {
      src: `${path}${imagePath}`,
      sizes: sizes,
      srcset: srcset,
    };
    return attributes;
  },

  _srcset: function(images) {
    const path = this.config.path;
    const srcset = images.reduce(function(memo, image) {
      return memo.concat(`${path}${image.dstPath} ${image.width}w`);
    }, []);

    return srcset.join(', ');
  },

  _sizes: function(sizesConfig) {
    const breakpoints = this.config.breakpoints;
    const sizes = Object.keys(sizesConfig)
            // default is always last
            .filter(key => key !== 'default')
            .reduce(
              (memo, key) => memo.concat(`${breakpoints[key]} ${sizesConfig[key]}`),
              []);

    // Add the default size to the end of the array without a
    // media query prefix.
    if (sizesConfig.default) {
      sizes.push(sizesConfig.default);
    }

    return sizes.join(', ') || '100vw';
  },

  _identify: identify,
  _resize: resize,
};

module.exports = ResponsiveImageConverter;
