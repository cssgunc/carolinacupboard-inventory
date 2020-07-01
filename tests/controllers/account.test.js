const supertest = require('supertest'),
    app = require('../../app'),
    dbUtil = require('../../db/db-util.js'),
    testUtil = require('../util/test-util');

require('dotenv').config();

describe('Account Routes - User Info Update Workflow', () => {
    before(async () => {
        await dbUtil.preTestSetup(false);
    });

    describe('GET /account/update - account update page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/account/update')
                .set(testUtil.commonHeaders)
                .set(testUtil.userAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET / - account update page, new user', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/')
                .set(testUtil.commonHeaders)
                .set({ uid: 'newUser' })
                .expect(302, done);
        });
    });

    describe('POST /account/update - update PID and email', () => {
        it('expect success HTTP 302 status', (done) => {
            const requestBody = {
                pid: '123',
                email: 'user@user.com'
            }
            supertest(app).post('/account/update')
                .set(testUtil.commonHeaders)
                .set(testUtil.userAuthHeaders)
                .send(requestBody)
                .expect(302, done);
        });
    });

    describe('POST /account/update - update info, invalid email', () => {
        it('expect success HTTP 200 status', (done) => {
            const requestBody = {
                pid: "123",
                email: "hello"
            }
            supertest(app).post('/account/update')
                .set(testUtil.commonHeaders)
                .set(testUtil.userAuthHeaders)
                .send(requestBody)
                .expect((res) => { testUtil.matchResponseText(res, testUtil.alertDanger) })
                .expect(200, done);
        });
    });
});