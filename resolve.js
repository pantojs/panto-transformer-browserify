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
        return;
    }
    const {
        entry,
        isStrict,
        isSilent
    } = options;

    const ast = esprima.parse(content, {
        range: true,
        tolerant: true,
        sourceType: 'module'
    });

    let depNames = [];

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

    depNames.forEach(depName => {
        let realName = path.join(path.dirname(filename), depName);

        if (contentCache.has(realName)) {
            depMap[depName] = realName;
            return
        }

        realName = nodeResolve.resolve(filename, depName, path.join(panto.getOption('cwd'), panto.getOption(
            'src')));
        if (realName) {
            let shortName = path.relative(filename, depName);
            depMap[depName] = shortName;

            panto.log.warn(`${realName}=>${shortName}`);

            resolveDependencies({
                filename: realName,
                content: contentCache.get(shortName) || panto.file.read(realName)
            }, fileMap, contentCache, options);
        }

    });

};

module.exports = (files, options) => {
    //[{filename,content},{filename,content}] => [{id,source,deps,entry},{id,source,deps,entry}]
    const fileMap = [];

    const contentCache = new Map();

    files.forEach(({
        filename,
        content
    }) => contentCache.set(filename, content));

    files.forEach(file => resolveDependencies(file, fileMap, contentCache, options));

    return fileMap;
};