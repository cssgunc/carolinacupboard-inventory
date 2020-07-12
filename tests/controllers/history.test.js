const supertest = require('supertest'),
    app = require('../../app'),
    ItemService = require('../../services/item-service'),
    dbUtil = require('../../db/db-util.js'),
    testUtil = require('../util/test-util');

require('dotenv').config();

describe('History Routes - GET pages', () => {
    before(async () => {
        await dbUtil.preTestSetup(false);
    });
    
    describe('GET /history - create item and transaction, get user history', () => {
        it('expect success HTTP 200 status', (done) => {
            // Create new item and transaction for user
            ItemService.createItem('chicken', '', '', 5).then(() => {
                ItemService.removeItems(1, 1, 'userOnyen', process.env.DEFAULT_ADMIN).then(() => {
                    supertest(app).get('/history')
                        .set(testUtil.userAuthHeaders)
                        .expect(200)
                        .end(async (err, res) => {
                            // Clear imported volunteers
                            await dbUtil.dropTables(false);
                            await dbUtil.createTables(false);
                            await dbUtil.initAdmin(false);
                            if (err) done(err);
                            else done();
                        });
                });
            });
        });
    });
});