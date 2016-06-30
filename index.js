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

ResponsiveImageConverter.prototype._identify = identify;
ResponsiveImageConverter.prototype._resize = resize;

ResponsiveImageConverter.prototype.generateSrcset = function(path, sizesConfig) {
  
  return this._identify(path).then(features => {
    const max = features.width;
    const min = this.config.minWidth;
    const steps = this.config.steps;

    const range = max - min;
    const step = Math.floor(range / steps);
    const sizes = Array.from({ length: steps }).map(function(value, index) {
      return min + (index * step);
    });

    return sizes;
  }).then(sizes => {
    return Promise.all(sizes.map(width => {
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
  }).then(images => {
    const srcset = images.reduce(function(memo, image) {
      return memo.concat(`${image.dstPath} ${image.width}w`);
    }, []);

    const breakpoints = this.config.breakpoints;
    const sizes = Object.keys(sizesConfig).reduce(function(memo, key) {
      if (key === 'default') {
        return memo;
      }
      return memo.concat(
        `${breakpoints[key]} ${sizesConfig[key]}`
      );
    }, []);

    if (sizesConfig.default) {
      sizes.push(sizesConfig.default);
    }
    
    const attributes = {
      src: path,
      sizes: sizes.join(', ') || '100vw',
      srcset: srcset.join(', ')
    };
    return attributes;
  });
};


module.exports = ResponsiveImageConverter;

// const converter = new ResponsiveImageConverter();
//converter.generateSrcset('flavian-amphitheater.jpg').then(console.log.bind(console)).catch(console.error);

// im.resize({
//   srcPath: 'flavian-amphitheater.jpg',
//   //dstPath: 'flavian-amphitheater-small.jpg',
//   //quality: 0.8,
//   //format: 'jpg',
//   //progressive: false,
//   width: 1400,
//   //height: 0,
//   //strip: true,
//   //filter: 'Lagrange',
//   //sharpening: 0.2,
//   //customArgs: []
// }, function(error, image) {
//   console.log('Images', typeof image);
//   im.identify(image, function(err, features){
//     if (err) throw err;
//     console.log('flavian-amphitheater-small.jpg', features.properties.signature);
//   });
// })


// im.identify('flavian-amphitheater.jpg', function(err, features){
//   if (err) throw err;
//   console.log('flavian-amphitheater.jpg', features.properties.signature);
// });
