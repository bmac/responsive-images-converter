const im = require('imagemagick');
const RSVP = require('rsvp');
const Promise = RSVP.Promise;
const _ = require('lodash');

// const crypto = require('crypto');
// crypto.createHash('sha256').update('Apple').digest('hex');

const identify = RSVP.denodeify(im.identify);
const resize = RSVP.denodeify(im.resize);

const defaults = {
  minWidth: 200,
  steps: 10,
};



function ResponsiveImageConverter(config) {
  this.config = _.defaults({}, config, defaults);
}

ResponsiveImageConverter.prototype.generateSrcset = function(path, sizesConfig) {
  
  return identify(path).then(features => {
    const max = features.width;
    const min = this.config.minWidth;
    const steps = this.config.steps;

    const range = max - min;
    const step = range / steps;
    const sizes = Array.from({ length: steps }).map(function(value, index) {
      return min + (index * step);
    });

    return sizes;
  }).then(function(sizes) {
    return Promise.all(sizes.map(function(width) {
      const pathParts = path.split('.');
      const pathStart = pathParts[0];
      const extension = pathParts[1];
      
      return resize({
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
  }).then(function(images) {
    const attributes = {
      src: path,
      // TODO calc sizes
      sizes: '100vw',
      srcset: images.reduce(function(memo, image) {
        return memo + `${image.dstPath} ${image.width}w, `;
      }, ''),
    };
    return attributes;
  });
};

const converter = new ResponsiveImageConverter();
converter.generateSrcset('flavian-amphitheater.jpg').then(console.log.bind(console)).catch(console.error);

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
