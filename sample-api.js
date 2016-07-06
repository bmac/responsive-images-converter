const ResponsiveImageConverter = require('./index')

const config = {
  breakpoints: {
    small: '(min-width: 768px)',
    medium: '(min-width: 992px)',
    large: '(min-width: 1200px)',
  }
};

const responsiveImage = new ResponsiveImageConverter(config);

responsiveImage.resizeImage('flavian-amphitheater.jpg', {
  small: '100vw',
  medium: '50vw',
  large: '25vw',
  default: '90vw',
}).then(function(attributes) {

  console.log(attributes);
  attributes === {
    src: 'flavian-amphitheater.jpg',
    srcset: 'flavian-amphitheater-1000.jpg 1000w, flavian-amphitheater-2000.jpg 2000w',
    sizes: '(min-width: 768px) 100vw, (min-width: 992px) 50vw, (min-width: 1200px) 25vw, 90vw',
  }

}).catch(console.error)





