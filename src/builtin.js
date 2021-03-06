/**
  * Copyright (C) 2016 pantojs.xyz
  * builtin.js
  *
  * changelog
  * 2016-07-28[10:04:05]:revised
  *
  * @author yanni4night@gmail.com
  * @version 0.1.0
  * @since 0.1.0
  */
'use strict';

exports.assert = require.resolve('assert/');
exports.child_process = require.resolve('./empty.js');
exports.cluster = require.resolve('./empty.js');
exports.crypto = require.resolve('crypto-browserify');
exports.dgram = require.resolve('./empty.js');
exports.dns = require.resolve('./empty.js');
exports.domain = require.resolve('domain-browser');
exports.events = require.resolve('events/');
exports.fs = require.resolve('./empty.js');
exports.http = require.resolve('stream-http');
exports.https = require.resolve('https-browserify');
exports.module = require.resolve('./empty.js');
exports.net = require.resolve('./empty.js');
exports.os = require.resolve('os-browserify/browser.js');
exports.path = require.resolve('path-browserify');
//exports.punycode = require.resolve('punycode/');
exports.querystring = require.resolve('querystring-es3/');
exports.readline = require.resolve('./empty.js');
exports.repl = require.resolve('./empty.js');
exports.stream = require.resolve('stream-browserify');
exports._stream_duplex = require.resolve('readable-stream/duplex.js');
exports._stream_passthrough = require.resolve('readable-stream/passthrough.js');
exports._stream_readable = require.resolve('readable-stream/readable.js');
exports._stream_transform = require.resolve('readable-stream/transform.js');
exports._stream_writable = require.resolve('readable-stream/writable.js');
exports.string_decoder = require.resolve('string_decoder/');
exports.sys = require.resolve('util/util.js');
exports.timers = require.resolve('timers-browserify');
exports.tls = require.resolve('./empty.js');
exports.tty = require.resolve('tty-browserify');
exports.url = require.resolve('url/');
exports.util = require.resolve('util/');
exports.vm = require.resolve('vm-browserify');
exports.zlib = require.resolve('browserify-zlib');
exports.process = require.resolve('./process');
exports.buffer = require.resolve('./buffer');
exports._merge = require.resolve('lodash/merge.js');