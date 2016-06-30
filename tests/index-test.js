const assert = require('chai').assert;
const ResponsiveImageConverter = require('../index');
const defaults = require('../lib/defaults');

function createSubjectForTest(config, fakeImageWidth) {
  config = config || {};
  fakeImageWidth = fakeImageWidth || 1600;

  const subject = new ResponsiveImageConverter(config, fakeImageWidth);
  subject._identify = () => Promise.resolve({ width: fakeImageWidth });
  subject._resize = () => Promise.resolve();

  return subject;
}

describe('ResponsiveImageConverter', function() {

  it('should have defaults config', function () {
    const subject = new ResponsiveImageConverter();
    assert.deepEqual(subject.config, defaults);
  });


  it('config options should override the defaults', function () {
    const subject = new ResponsiveImageConverter({
      minWidth: 315,
      steps: 117,
    });
    assert.equal(subject.config.minWidth, 315);
    assert.equal(subject.config.steps, 117);
  });


  it('generateSrcset should resolve with sizes src and srcset', function () {
    const subject = createSubjectForTest({'foo': 'bar'});

    return subject.generateSrcset('file-path.jpg', {})
      .then(attributes => {
        assert.equal(attributes.sizes, '100vw');
        assert.equal(attributes.src, 'file-path.jpg');
        assert.equal(attributes.srcset, 'file-path-200.jpg 200w, file-path-340.jpg 340w, file-path-480.jpg 480w, file-path-620.jpg 620w, file-path-760.jpg 760w, file-path-900.jpg 900w, file-path-1040.jpg 1040w, file-path-1180.jpg 1180w, file-path-1320.jpg 1320w, file-path-1460.jpg 1460w');
      });
  });

  it('generateSrcset should generate sizes based on the config', function () {
    const subject = createSubjectForTest({
      breakpoints: {
        small: '(min-width: 768px)',
      }
    });

    return subject.generateSrcset('file-path.jpg', { small: '100vw', default: '50vw'})
      .then(attributes => {
        assert.equal(attributes.sizes, '(min-width: 768px) 100vw, 50vw');

        assert.equal(attributes.src, 'file-path.jpg');
        assert.equal(attributes.srcset, 'file-path-200.jpg 200w, file-path-340.jpg 340w, file-path-480.jpg 480w, file-path-620.jpg 620w, file-path-760.jpg 760w, file-path-900.jpg 900w, file-path-1040.jpg 1040w, file-path-1180.jpg 1180w, file-path-1320.jpg 1320w, file-path-1460.jpg 1460w');
      });
  });
});