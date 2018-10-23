'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _events = require('events');

/**
 * create handler
 * @param  {Array|Object} option  [{ path: '/hook1', secret: 'secret' }] or { path: '/hook1', secret: 'secret' }
 * @return {Function}  koa middleware
 */
function create(option) {

    function handler(ctx, next) {

        function hasError(msg) {
            ctx.status = 401;
            ctx.body = msg;
        }

        if (ctx.method !== 'POST') {
            return next();
        }

        var curOpt = void 0;

        if (Array.isArray(option)) {
            curOpt = option.find(function (item) {
                return ctx.path.search(item.path) === 0;
            });
        } else {
            curOpt = option;
        }

        if (!curOpt || ctx.path.search(curOpt.path) !== 0) {
            return next();
        }

        var token = ctx.headers['x-gitlab-token'];

        if (curOpt.secret && (!token || token !== curOpt.secret)) {
            return hasError('No X-Gitlab-Token found on request or the token did not match');
        }

        var event = ctx.headers['x-gitlab-event'];

        if (!event) return hasError('No X-Gitlab-Event found on request');

        ctx.status = 200;
        ctx.headers['Content-Type'] = 'application/json';
        ctx.body = '{"ok":true}';

        var eventName = event.toLowerCase().replace(/hook/, '').trim().replace(' ', '_');

        var emitData = {
            eventName: eventName,
            pathname: curOpt.path,
            playload: ctx.request.body,
            protocol: ctx.protocol,
            host: ctx.headers['host'],
            url: ctx.url
        };

        handler.emit(eventName, emitData);
        handler.emit('*', emitData);
    }

    handler.__proto__ = _events.EventEmitter.prototype;
    _events.EventEmitter.call(handler);
    return handler;
}

exports.default = create;