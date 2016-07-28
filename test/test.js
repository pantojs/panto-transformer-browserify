/**
 * Copyright (C) 2016 pantojs.xyz
 * test.js
 *
 * changelog
 * 2016-06-24[17:01:26]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const assert = require('assert');
const panto = require('panto');
const BrowserifyTransformer = require('../src/');

panto.loadTransformer('read', require('panto-transformer-read'));
panto.loadTransformer('write', require('panto-transformer-write'));
panto.loadTransformer('browserify', BrowserifyTransformer);

describe('panto-transformer-browserify', () => {
    describe('#transformAll', function() {
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

            panto.$('polyfill.js').read().browserify({
                entry: 'polyfill.js',
                bundle: 'polyfill.js'
            }).write();
            panto.$('test-polyfill.js').read().browserify({
                entry: 'test-polyfill.js',
                bundle: 'test-polyfill.js'
            }).write();

            panto.build().then(() => done()).catch(e => console.error(e));
        });
    });
});
