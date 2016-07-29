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
var assert = require('assert');

describe('#polyfill', function () {
    var builtins =
        'assert,child_process,cluster,crypto,dgram,dns,domain,events,fs,http,https,module,net,os,path,querystring,readline,repl,stream,string_decoder,sys,timers,tls,tty,url,util,vm,zlib,process,buffer'
        .split(',');
    builtins.forEach(function (builtin) {
        it(builtin, function () {
            assert.ok(window['__$' + builtin]);
        });
    });
    it('should get process.env.NODE_ENV', function () {
        assert.deepEqual(process.env.NODE_ENV, 'production');
    });
});