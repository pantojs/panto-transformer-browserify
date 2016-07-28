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
    return `result-${Date.now()}.es`;
};

describe('panto-transformer-browserify', () => {
    describe('#transformAll', () => {
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
            const f = '../polyfill.js';
            const builtins =
                Object.keys(require('../builtin'));

            const files = [{
                filename: 'main.js',
                content: builtins.map(function (builtin) {
                    return 'var ' + builtin + ' = require("' + builtin +
                        '");window.__$' + builtin + ' = ' + builtin + ';'
                }).join('\n')
            }];
            new BrowserifyTransformer({
                filename: 'bundle.js',
                entry: 'main.js'
            }).transformAll(files).then(files => {
                return panto.file.write(f, files[0].content)
            }).then(() => done()).catch(e => {
                console.error(e);
            });
        });
    });
});