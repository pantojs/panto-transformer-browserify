/**
 * Copyright (C) 2016 pantojs.xyz
 * test.js
 *
 * changelog
 * 2016-06-24[17:01:26]:revised
 * 2016-08-17[23:30:46]:test case for useless module(s)
 * 2016-09-07[23:24:29]:support alias option
 *
 * @author yanni4night@gmail.com
 * @version 0.1.5
 * @since 0.1.0
 */
'use strict';
const assert = require('assert');
const panto = require('panto');
const BrowserifyTransformer = require('../src/');

panto.loadTransformer('read', require('panto-transformer-read'));
panto.loadTransformer('write', require('panto-transformer-write'));
panto.loadTransformer('browserify', BrowserifyTransformer);

describe('panto-transformer-browserify', () => {
    describe('#transformAll', function () {
        this.timeout(5e3);
        it('should error when dynamic', done => {
            const files = [{
                filename: 'main.js',
                content: 'var foo = require(6 + "foo.js");foo();'
            }];
            new BrowserifyTransformer({
                filename: 'bundle.js',
                entry: 'main.js',
                isStrict: true
            }).transformAll(files).catch(e => {
                done();
            });
        });
        it('should error when not found', done => {
            const files = [{
                filename: 'main.js',
                content: 'var foo = require("foo.js");foo();'
            }];
            new BrowserifyTransformer({
                filename: 'bundle.js',
                entry: 'main.js',
                isStrict: true,
                isSilent: false
            }).transformAll(files).catch(e => {
                done();
            });
        });
        it('should polyfill', done => {
            panto.clear();
            panto.setOptions({
                cwd: __dirname + '/../',
                src: 'polyfill',
                output: 'dist'
            });

            panto.$('polyfill.js').tag('polyfill.js').read().browserify({
                entry: 'polyfill.js',
                bundle: 'polyfill.js',
                buffer: true,
                process: {
                    env: {
                        NODE_ENV: 'production'
                    }
                }
            }).write();
            panto.$('test-polyfill.js').tag('test-polyfill.js').read().browserify({
                entry: 'test-polyfill.js',
                bundle: 'test-polyfill.js'
            }).write();

            panto.build().then(() => done()).catch(e => console.error(e));
        });
        it('should remove useless modules', done => {
            const files = [{
                filename: 'main.js',
                content: 'require("bar.js");module.exports = 80;'
            }, {
                filename: 'bar.js',
                content: 'module.exports = 93;'
            }, {
                filename: 'foo.js',
                content: 'module.exports = 67;'
            }];
            new BrowserifyTransformer({
                filename: 'bundle.js',
                entry: 'main.js',
                isStrict: true,
                isSilent: false
            }).transformAll(files).then(files => {
                const file = files[0];
                assert.ok(/80/.test(file.content), 'has main.js');
                assert.ok(/93/.test(file.content), 'has bar.js');
                assert.ok(!/67/.test(file.content), 'has no foo.js');
            }).then(() => done()).catch(e => console.error(e));
        });
        it('should support alias', done => {
            const files = [{
                filename: 'main.js',
                content: 'require("bar.js");module.exports = 80;'
            }, {
                filename: 'bar.js',
                content: 'module.exports = 93;'
            }, {
                filename: 'foo.js',
                content: 'module.exports = 67;'
            }];
            new BrowserifyTransformer({
                filename: 'bundle.js',
                entry: 'main.js',
                alias: {
                    "bar.js": "foo.js"
                },
                isStrict: true,
                isSilent: false
            }).transformAll(files).then(files => {
                const file = files[0];
                assert.ok(/80/.test(file.content), 'has main.js');
                assert.ok(!/93/.test(file.content), 'has no bar.js');
                assert.ok(/67/.test(file.content), 'has foo.js');
            }).then(() => done()).catch(e => console.error(e));
        });
    });
});
