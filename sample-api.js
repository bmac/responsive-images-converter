const ResponsiveImageConverter = require('responsive-image-converter')

const config = {
  breakpoints: {
    small: '(min-width: 768px)',
    medium: '(min-width: 992px)',
    large: '(min-width: 1200px)',
  }
};

const responsiveImage = new ResponsiveImageConverter(config);

responsiveImage.generateSrcset('./flavian-amphitheater.jpg', {
  small: '100vw',
  medium: '50vw',
  large: '25vw',
  default: '90vw',
}).then(function(attributes) {

  attributes === {
    src: 'asdf-flavian-amphitheater.jpg',
    srcset: 'asdf-flavian-amphitheater.jpg 1000w, ghjk-flavian-amphitheater.jpg 2000w',
    sizes: '(min-width: 768px) 100vw, (min-width: 992px) 50vw, (min-width: 1200px) 25vw, 90vw',
  }

})





