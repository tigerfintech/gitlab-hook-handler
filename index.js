
import { EventEmitter } from 'events';

/**
 * create handler
 * @param  {Array|Object} option  [{ path: '/hook1', secret: 'secret' }] or { path: '/hook1', secret: 'secret' }
 * @return {Function}  koa middleware
 */
function create (option) {

    function handler (ctx, next) {

        function hasError (msg) {
            ctx.status = 401;
            ctx.body = msg;
        }

        if (ctx.method !== 'POST') {
            return next();
        }

        let curOpt;

        if (Array.isArray(option)) {
            curOpt = option.find((item) => ctx.path.search(item.path) === 0);
        } else {
            curOpt = option;
        }

        if (!curOpt || ctx.path.search(curOpt.path) !== 0) {
            return next();
        }

        const token = ctx.headers['x-gitlab-token'];

        if(curOpt.secret && (!token || token !== curOpt.secret)) {
            return hasError('No X-Gitlab-Token found on request or the token did not match');
        }

        const event = ctx.headers['x-gitlab-event'];

        if (!event) return hasError('No X-Gitlab-Event found on request');

        ctx.status = 200;
        ctx.headers['Content-Type'] = 'application/json';
        ctx.body = '{"ok":true}';

        const emitData = {
            event,
            path: curOpt.path,
            playload: ctx.request.body,
            protocol: req.protocol,
            host: ctx.headers['host'],
            url: ctx.url
        };

        handler.emit(event, emitData);
        handler.emit('*', emitData);
    }
    

    handler.__proto__ = EventEmitter.prototype;
    EventEmitter.call(handler);
    return handler;
}

export default create;