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
const BrowserifyTransformer = require('../');

panto.file.rimraf(__dirname + '/result*', {
    force: true
});

panto.setOptions({
    cwd: __dirname,
    src: '.',
    output: '.'
});

const createTmpFile = () => {
    return `result-${Date.now()}.js`;
};

describe('panto-transformer-browserify', () => {
    describe('#transformAll', () => {
        it('should bundle node_moduels', done => {
            const files = [{
                filename: 'main.js',
                content: 'var React = require("react"); module.exports = global.React = React;'
            }];
            const f = createTmpFile();
            new BrowserifyTransformer({
                bundle: 'bundle.js',
                entry: 'main.js',
                isStrict: false,
                isSilent: false
            }).transformAll(files).then(files => {
                return panto.file.write(f, files[0].content);
            }).then(() => {
                require(__dirname + '/' + f);
                assert.ok(!!global.React);
                return panto.file.rimraf(f);
            }).then(() => done()).catch(e => console.error(
                e));
        });
        it('should browserify', done => {
            const files = [{
                filename: 'main.js',
                content: 'var foo = require("./foo.js");foo();'
            }, {
                filename: 'foo.js',
                content: 'module.exports = function(){global.__counter++;};'
            }];
            const f = createTmpFile();
            new BrowserifyTransformer({
                bundle: 'bundle.js',
                entry: 'main.js'
            }).transformAll(files).then(files => {
                assert.deepEqual(files[0].filename, 'bundle.js');
                return panto.file.write(f,
                    'global.__counter=0;' + files[0].content +
                    ';module.exports=global.__counter;');

            }).then(() => {
                assert.deepEqual(require(__dirname + '/' + f), 1);
                return panto.file.rimraf(f);
            }).then(() => done()).catch(e => console.error(e));
        });
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
    });
});