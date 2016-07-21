/**
 * Copyright (C) 2016 yanni4night.com
 * resolve.js
 *
 * changelog
 * 2016-07-21[13:12:07]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */
'use strict';

const nodeResolve = require('node-resolve');
const path = require('path');
const esprima = require('esprima');

const resolveDependencies = ({
    filename,
    content
}, fileMap, contentCache, options) => {

    if (fileMap.some(({
            id
        }) => filename === id)) {
        // Has it
        return Promise.resolve();
    }

    const {
        entry,
        isStrict,
        isSilent
    } = options;

    const depNames = [];

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
                } else if (!isSilent) {
                    panto.log.warn(errMsg);
                }
            } else {
                let d = value.arguments[0].value;
                depNames.push(d);
            }
        }

        return value;
    });


    let depMap = {};

    fileMap.push({
        id: filename,
        source: content,
        deps: depMap,
        entry: filename === entry
    });

    if (0 === depNames.length) {
        return Promise.resolve();
    }

    const promises = depNames.map(depName => {
        return new Promise((resolve, reject) => {
            let realName = path.join(path.dirname(filename), depName);

            if (contentCache.has(realName)) {
                depMap[depName] = realName;
                return resolve();
            }

            realName = nodeResolve.resolve(filename, depName, path.join(panto.getOption('cwd'),
                panto.getOption('src')));

            if (realName) {
                depMap[depName] = realName;

                if (contentCache.has(realName)) {
                    return resolveDependencies({
                        filename: realName,
                        content: contentCache.get(realName)
                    }, fileMap, contentCache, options).then(resolve, reject);
                } else {
                    return panto.file.read(realName).then(content => {
                        return resolveDependencies({
                            filename: realName,
                            content
                        }, fileMap, contentCache, options);
                    }).then(resolve, reject);
                }
            } else {
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
