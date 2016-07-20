# panto-transformer-browserify
[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

Browserify transformer for panto.

```js
panto.loadTransformer('browserify');

panto.pick('**/*.js').browserify({
    entry: 'main.js'
    bundle: 'bundle.js'
});
```

## options:
 - entry:String
 - bundle:String

[npm-url]: https://npmjs.org/package/panto-transformer-browserify
[downloads-image]: http://img.shields.io/npm/dm/panto-transformer-browserify.svg
[npm-image]: http://img.shields.io/npm/v/panto-transformer-browserify.svg
[travis-url]: https://travis-ci.org/pantojs/panto-transformer-browserify
[travis-image]: http://img.shields.io/travis/pantojs/panto-transformer-browserify.svg
[david-dm-url]:https://david-dm.org/pantojs/panto-transformer-browserify
[david-dm-image]:https://david-dm.org/pantojs/panto-transformer-browserify.svg
[david-dm-dev-url]:https://david-dm.org/pantojs/panto-transformer-browserify#info=devDependencies
[david-dm-dev-image]:https://david-dm.org/pantojs/panto-transformer-browserify/dev-status.svg
