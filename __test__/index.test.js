
import { createMockContext } from '@shopify/jest-koa-mocks';
import create from '../index';


describe('index test', () => {

    it('single hook, request hit the hook', (done) => {

        const handler = create({ path: '/hook' });
        const ctx = createMockContext({
            url: 'http://a.b.c/hook',
            method: 'POST',
            headers: {
                'x-gitlab-event': 'Note Hook'
            },
            requestBody: { a: 1 }
        });
        const cbSpy = jest.fn();
        handler.on('*', (m) => {
            expect(JSON.stringify(m)).toEqual(
                "{\"eventName\":\"note\",\"pathname\":\"/hook\",\"playload\":{\"a\":1},\"protocol\":\"http\",\"host\":\"a.b.c\",\"url\":\"http://a.b.c/hook\"}"
            );
            done();
        });

        const spy = jest.fn();
        handler(ctx, spy);

    });

    it('single hook, request hit none', (done) => {

        const handler = create({ path: '/hook11' });
        const ctx = createMockContext({
            url: '/hook1',
            method: 'POST',
            headers: {
                'x-gitlab-event': 'Note Hook'
            },
            requestBody: { a: 1 }
        });

        const cb = () => {
            expect(true).toEqual(true);
            done();
        };
        handler(ctx, cb);
    });


    it('single hook, request hit, but no token', () => {
        const handler = create({ path: '/hook', secret: 'xxxx' });
        const ctx = createMockContext({
            url: '/hook',
            method: 'POST',
            headers: {
                'x-gitlab-event': 'Note Hook'
            }
        });
        handler(ctx, jest.fn());
        expect(ctx.status).toEqual(401);
        expect(ctx.body).toEqual('No X-Gitlab-Token found on request or the token did not match');
    });

    it('single hook, request hit, token matched', (done) => {

        const handler = create({ path: '/hook', secret: 'xxxx' });
        const ctx = createMockContext({
            url: '/hook',
            method: 'POST',
            headers: {
                'x-gitlab-event': 'Note Hook',
                'x-gitlab-token': 'xxxx'
            },
            requestBody: { a: 1 }
        });
        const cbSpy = jest.fn();
        handler.on('*', (m) => {
            expect(JSON.stringify(m)).toEqual(
                "{\"eventName\":\"note\",\"pathname\":\"/hook\",\"playload\":{\"a\":1},\"protocol\":\"http\",\"host\":\"test.com\",\"url\":\"http://test.com/hook\"}"
            );
            done();
        });
        handler(ctx, jest.fn());
    });

    it('two hooks, hit one', (done) => {
        const handler = create([{ path: '/hook11' }, { path: '/hook1' }]);
        const ctx = createMockContext({
            url: '/hook1',
            method: 'POST',
            headers: {
                'x-gitlab-event': 'Note Hook'
            },
            requestBody: { a: 1 }
        });
        const cbSpy = jest.fn();
        handler.on('*', (m) => {
            expect(JSON.stringify(m)).toEqual(
                "{\"eventName\":\"note\",\"pathname\":\"/hook1\",\"playload\":{\"a\":1},\"protocol\":\"http\",\"host\":\"test.com\",\"url\":\"http://test.com/hook1\"}"
            );
            done();
        });

        handler(ctx, jest.fn());
    });

})