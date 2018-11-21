### Install

    yarn add gitlab-hook-handler

    // or

    npm i gitlab-hook-handler


### Usage with Koa


    import Koa from 'koa';
    import createHandler from 'gitlab-hook-handler';

    const app = new Koa();

    const handler = createHandler({
        path: '/gitlab-webhook',
        secret: 'xxx'  // optional
    });

    // or multiple hooks
    const handler = createHandler([
        {
            path: '/hook1',
            secret: 'xxx' // optional
        },
        {
            path: '/hook2',
            secret: 'xxx'  // optional
        }
    ])


    // you can listen on merge_request, note, push, tag_push ...
    handler.on('merge_request', function (event) {
        const { eventName, payload, pathname, host, url, protocol } = event;

        // do something
    });

    handler.on('*', function (event) {
        const { eventName, payload, pathname, host, url, protocol } = event;

        // do something
    })