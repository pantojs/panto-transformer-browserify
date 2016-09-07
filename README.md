# panto-transformer-browserify
[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url] [![Coverage Status][coveralls-image]][coveralls-url]

Browserify transformer for panto.

This [transformer](https://github.com/pantojs/panto-transformer) supports bundle modules in node_modules.

```js
panto.loadTransformer('browserify');

panto.$('**/*.js').browserify({
    entry: 'main.js',
    bundle: 'bundle.js',
    buffer: true,
    process: {
        env: {
            NODE_ENV: 'production'
        }
    },
    aliases: {
        react: 'preact-compat'
    }
});
```

## options:
 - entry: String
 - bundle: String
 - isStrict: Boolean
 - isSilent: Boolean
 - buffer: Boolean, if use `Buffer` polyfill
 - process: Boolean|Object
 - aliases: Object

[npm-url]: https://npmjs.org/package/panto-transformer-browserify
[downloads-image]: http://img.shields.io/npm/dm/panto-transformer-browserify.svg
[npm-image]: http://img.shields.io/npm/v/panto-transformer-browserify.svg
[travis-url]: https://travis-ci.org/pantojs/panto-transformer-browserify
[travis-image]: http://img.shields.io/travis/pantojs/panto-transformer-browserify.svg
[david-dm-url]:https://david-dm.org/pantojs/panto-transformer-browserify
[david-dm-image]:https://david-dm.org/pantojs/panto-transformer-browserify.svg
[david-dm-dev-url]:https://david-dm.org/pantojs/panto-transformer-browserify#type=dev
[david-dm-dev-image]:https://david-dm.org/pantojs/panto-transformer-browserify/dev-status.svg
[coveralls-image]:https://coveralls.io/repos/github/pantojs/panto-transformer-browserify/badge.svg?branch=master
[coveralls-url]:https://coveralls.io/github/pantojs/panto-transformer-browserify?branch=master
