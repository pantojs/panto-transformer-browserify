/**
 * Copyright (C) 2016 yanni4night.com
 * resolve.js
 *
 * changelog
 * 2016-07-21[13:12:07]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.1
 * @since 0.1.0
 */
'use strict';

const nodeResolve = require('node-resolve');
const path = require('path');
const esprima = require('esprima');
const isBuiltinModule = require('is-builtin-module');
const builtin = require('./builtin');

const resolveDependencies = (file, fileMap, contentCache, options) => {
    let {
        filename,
        content
    } = file;

    const BASE_DIR = file.basedir || panto.file.locate('.');

    if (fileMap.some(({
            id
        }) => filename === id)) {
        // Has it
        return Promise.resolve();
    }

    const {
        entry,
        isSlient,
        isStrict
    } = options;

    const depNames = [];

    try {
        const ast = esprima.parse(content, {
            range: true,
            tolerant: true,
            sourceType: 'module'
        });
        JSON.stringify(ast, (key, value) => {
            if (value && 'CallExpression' === value.type && value.callee && 'require' === value
                .callee.name && Array.isArray(value.arguments)) {
                if (value.arguments.length !== 1 || 'Literal' !== value.arguments[0].type) {
                    const expression = content.slice(value.range[0], value.range[1]);
                    const errMsg = `Dynamic require is not supported: "${expression}"` + (
                        filename ? ` in ${filename}` : '');
                    if (isStrict) {
                        throw new Error(errMsg);
                    }
                } else {
                    let d = value.arguments[0].value;
                    depNames.push(d);
                }
            }

            return value;
        });
    } catch (e) {
        if (!isSlient) {
            panto.log.warn(`BrowserifyTransform parse error:[${filename}]: ${e.message}`);
        }
        return Promise.reject(e);
    }

    let depMap = {};

    const isEntry = panto.file.locate(filename) === panto.file.locate(entry);

    fileMap.push({
        id: filename,
        source: content,
        deps: depMap,
        entry: isEntry
    });

    if (isEntry) {
        depNames.unshift('process', 'buffer');
    }

    if (0 === depNames.length) {
        return Promise.resolve();
    }

    const promises = depNames.map(depName => {
        return new Promise((resolve, reject) => {

            if (isBuiltinModule(depName) || (depName in builtin)) {
                // It's a builtin module, loopup polyfill
                if (depName in builtin) {
                    const realPolyfillPath = require.resolve(builtin[depName]);
                    const polyfillId = path.relative(__dirname, realPolyfillPath);
                    depMap[depName] = polyfillId;
                    const xxx = path.relative(panto.file.locate('.'), realPolyfillPath);

                    return panto.file.read(xxx).then(content => {
                        if (/\.json$/i.test(xxx)) {
                            content = 'module.exports=' + content;
                        }
                        return resolveDependencies({
                            filename: polyfillId,
                            content,
                            basedir: __dirname
                        }, fileMap, contentCache, options);
                    }).then(resolve, reject);
                } else {
                    depMap[depName] = depName;
                    fileMap.push({
                        id: depName,
                        source: '',
                        deps: {}
                    });
                    return resolve();
                }
            }


            let realName = path.join(path.dirname(filename), depName);

            if (contentCache.has(realName)) {
                depMap[depName] = realName;
                return resolve();
            }

            realName = nodeResolve.resolve(filename, depName, BASE_DIR, true);

            if (realName) {
                depMap[depName] = realName;

                if (contentCache.has(realName)) {
                    return resolveDependencies({
                        filename: realName,
                        content: contentCache.get(realName),
                        basedir: BASE_DIR
                    }, fileMap, contentCache, options).then(resolve, reject);
                } else {
                    const xxx = path.relative(panto.file.locate('.'), path.join(BASE_DIR, realName));
                    return panto.file.read(xxx).then(content => {
                        if (/\.json$/i.test(xxx)) {
                            content = 'module.exports=' + content;
                        }
                        return resolveDependencies({
                            filename: realName,
                            content,
                            basedir: BASE_DIR
                        }, fileMap, contentCache, options);
                    }).then(resolve, reject);
                }
            } else {
                depMap[depName] = depName;
                return resolve();
            }

        });

    });

    return Promise.all(promises);
};

module.exports = (files, options) => {
    //[{filename,content},{filename,content}] => [{id,source,deps,entry},{id,source,deps,entry}]
    const fileMap = [];

    const contentCache = new Map();

    files.forEach(({
        filename,
        content
    }) => contentCache.set(filename, content));

    const promises = files.map(file => resolveDependencies(file, fileMap, contentCache, options));

    return files.length ? Promise.all(promises).then(() => fileMap) : Promise.resolve(fileMap);
};
