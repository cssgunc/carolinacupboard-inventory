const supertest = require('supertest'),
    app = require('../../app'),
    dbUtil = require('../../db/db-util.js'),
    ItemService = require('../../services/item-service'),
    testUtil = require('../util/test-util');

require('dotenv').config();

describe('Items Routes - Item Preorder Workflow', () => {
    before(async () => {
        await dbUtil.preTestSetup(false);
    });
    describe('GET /items - items main page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/items')
                .set(testUtil.userAuthHeaders)
                .expect(200, done);
        });
    });
});