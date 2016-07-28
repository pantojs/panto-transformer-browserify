/**
 * Copyright (C) 2016 pantojs.xyz
 * test-polyfill.js
 *
 * changelog
 * 2016-07-28[15:20:47]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */
'use strict';
describe('#polyfill', function () {
    var builtins =
        Object.keys(require('../builtin'));
    builtins.forEach(function (builtin) {
        it(builtin, function() {
            assert.ok(window['__$' + builtin]);
        });
    });
});