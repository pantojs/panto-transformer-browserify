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
const esprima = require('esprima');

class BrowserifyTransformer extends Transformer {
    transformAll(files) {
        const {
            entry,
            bundle,
            isStrict,
            isSilent
        } = this.options;

        const resolveDependencies = ({filename, content}) => {
            const ast = esprima.parse(content, {
                range: true,
                tolerant: true,
                sourceType: 'module'
            });

            let deps = {};

            JSON.stringify(ast, (key, value) => {
                if (value && 'CallExpression' === value.type && value.callee && 'require' === value
                    .callee.name &&
                    Array.isArray(value.arguments)) {
                    if (value.arguments.length !== 1 || 'Literal' !== value.arguments[0].type) {
                        const expression = content.slice(value.range[0], value.range[1]);
                        const errMsg = `Dynamic require is not supported: "${expression}"` + (
                            filename ?
                            ` in ${filename}` : '');
                        if (isStrict) {
                            throw new Error(errMsg);
                        } else if (!isSilent) {
                            panto.log.warn(errMsg);
                        }
                    } else {
                        let d = value.arguments[0].value;
                        deps[d] = d;
                    }
                }

                return value;
            });

            return deps;
        };

        return new Promise(resolve => {

            const data = files.map(file => {
                return {
                    id: file.filename,
                    source: file.content,
                    deps: resolveDependencies(file),
                    entry: entry === file.filename
                };
            });

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

            p.end(JSON.stringify(data));
        });
    }
    isTorrential() {
        return true;
    }
}

module.exports = BrowserifyTransformer;