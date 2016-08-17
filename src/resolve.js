/**
 * Copyright (C) 2016 pantojs.xyz
 * resolve.js
 *
 * changelog
 * 2016-07-21[13:12:07]:revised
 * 2016-08-17[23:30:03]:remove useless module(s)
 *
 * @author yanni4night@gmail.com
 * @version 0.1.4
 * @since 0.1.0
 */
'use strict';

const nodeResolve = require('node-resolve');
const path = require('path');
const esprima = require('esprima');
const isBuiltinModule = require('is-builtin-module');
const builtin = require('./builtin');
const DiskMap = require('disk-map');
const crypto = require('crypto');


// internal cache
const cache = new DiskMap();

const digest = content => {
    return crypto.createHash('md5').update(content).digest('hex');
};

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
        isStrict,
        buffer,
        process
    } = options;

    let depNames = [];

    const md5 = digest(content);

    if (cache.has(md5)) {
        depNames = JSON.parse(cache.get(md5));
    } else {

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
        cache.set(md5, JSON.stringify(depNames));
    }

    let depMap = {};

    const isEntry = panto.file.locate(filename) === panto.file.locate(entry);

    // mock buffer in global context
    if (isEntry && buffer) {
        depNames.unshift('buffer');
        content = ';require(\'buffer\');' + content;
    }
    // mock process in global context
    if (isEntry && process) {
        depNames.unshift('process');

        let preContent = ';require(\'process\');';

        if (panto._.isPlainObject(process)) {
            depNames.unshift('_merge');
            preContent = `;require('_merge')(require(\'process\'),${JSON.stringify(process)});`;
        }

        content = preContent + content;
    }

    // Add it
    fileMap.push({
        id: filename,
        source: content,
        deps: depMap,
        entry: isEntry
    });

    // unique dependencies
    depNames = panto._.uniq(depNames);

    // no dependency?
    if (0 === depNames.length) {
        return Promise.resolve();
    }

    const promises = depNames.map(depName => {
        return new Promise((resolve, reject) => {
            // It's a builtin module, loopup polyfill
            if (isBuiltinModule(depName) || (depName in builtin)) {
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
            // Find in memory cache first
            if (contentCache.has(realName)) {
                depMap[depName] = realName;
                return resolveDependencies({
                    filename: realName,
                    content: contentCache.get(realName),
                    basedir: BASE_DIR
                }, fileMap, contentCache, options).then(resolve, reject);
            }

            // Find in file system
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
                // not found
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

    let entryFile;

    files.forEach(file => {
        const {
            filename,
            content
        } = file;

        contentCache.set(filename, content);

        const isEntry = panto.file.locate(filename) === panto.file.locate(options.entry);

        if (isEntry) {
            entryFile = file;
        }
    });

    if (!entryFile) {
        return Promise.resolve(fileMap);
    } else {
        // through entry file ONLY
        return resolveDependencies(entryFile, fileMap, contentCache, options).then(() => fileMap);
    }
};
