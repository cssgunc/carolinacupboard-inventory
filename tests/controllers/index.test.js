const supertest = require('supertest'),
    should = require('should');
    app = require('../../app');
    dbUtil = require('../../db/db-util.js');
    testUtil = require('../util/test-util');

require('dotenv').config();

describe('Index routes - GET pages', () => {
    before(async () => {
        await dbUtil.preTestSetup();
    });
    
    describe('GET / - home page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/')
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });
});