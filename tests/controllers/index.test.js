const supertest = require('supertest'),
    should = require('should');
    app = require('../../app');
    dbUtil = require('../../db/db-util.js');
    testUtil = require('../util/test-util');

require('dotenv').config();

before(async () => {
    await dbUtil.dropTables(false);
    await dbUtil.createTables(false);
    await dbUtil.initAdmin(false);
    await dbUtil.initTestUsers(false);
});

describe('Index routes - GET pages', () => {
    describe('GET / - home page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/')
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });
});