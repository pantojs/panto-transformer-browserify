/**
 * Copyright (C) 2016 pantojs.xyz
 * index.js
 *
 * changelog
 * 2016-07-16[23:27:20]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */
'use strict';

const Transformer = require('panto-transformer');
const pack = require('browser-pack');

class BrowserifyTransformer extends Transformer {
    transformAll(files) {
        const {
            entry,
            bundle
        } = this.options;

        const data = files.map(file => {
            const deps = {};
            file.deps.forEach(dep => {
                deps[dep] = dep;
            });
            return {
                id: file.filename,
                source: file.content,
                deps,
                entry: entry === file.filename
            };
        });

        return new Promise((resolve, reject) => {
            const p = pack({});
            let src = '';
            p.on('data', function (buf) {
                src += buf;
            });
            p.on('end', function () {
                resolve([{
                    content: src,
                    filename: bundle
                }]);
            });
            // TODO
            p.on('error', function (err) {
                reject(err);
            });

            p.end(JSON.stringify(data));
        });
    }
    isTorrential() {
        return true;
    }
}

module.exports = BrowserifyTransformer;