/**
 * Copyright (C) 2016 pantojs.xyz
 * index.js
 *
 * changelog
 * 2016-07-16[23:27:20]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.1
 * @since 0.1.0
 */
'use strict';

const Transformer = require('panto-transformer');
const pack = require('browser-pack');
const resolveDeps = require('./resolve');

class BrowserifyTransformer extends Transformer {
    transformAll(files) {

        const {
            isStrict,
            isSilent
        } = this.options;

        const validate = data => {
            let foundEntry = false;
            data.forEach(({
                id,
                deps,
                entry
            }) => {
                if (true === entry) {
                    if (foundEntry) {
                        throw new Error(`Found two entries, only one is permitted`);
                    }
                    foundEntry = true;
                }
                for (let key in deps) {
                    let dep = deps[key];
                    if (dep === id) {
                        throw new Error('Cannot depend on self: ${id}');
                    }
                    if (!data.some(({
                            id
                        }) => (id === dep))) {
                        const errMsg = `${dep} not found for ${id}`;
                        if (isStrict) {
                            throw new Error(errMsg);
                        } else if (!isSilent) {
                            panto.log.warn(errMsg);
                        }
                    }
                }
            });
        };
        return resolveDeps(files, this.options).then(data => {

            validate(data);

            return new Promise(resolve => {

                const p = pack({});

                let src = '';

                p.on('data', buf => {
                    src += buf;
                });

                p.on('end', () => {
                    resolve([{
                        content: `(function(global){${src}})(this);`,
                        filename: this.options.bundle || this.options.entry
                    }]);
                });

                p.end(JSON.stringify(data));
            });
        });
    }
    isTorrential() {
        return true;
    }
}

module.exports = BrowserifyTransformer;
