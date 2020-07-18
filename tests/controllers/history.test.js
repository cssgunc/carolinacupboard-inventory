const supertest = require('supertest'),
    app = require('../../app'),
    ItemService = require('../../services/item-service'),
    dbUtil = require('../../db/db-util.js'),
    testUtil = require('../util/test-util');

require('dotenv').config();

var itemId = '';

describe('History Routes - GET pages', () => {
    before(async () => {
        await dbUtil.preTestSetup();
        await ItemService.createItem('chicken', '', '', 5);
        itemId = (await ItemService.getAllItems())[0].get('id');
        await ItemService.removeItems(itemId, 1, 'userOnyen', process.env.DEFAULT_ADMIN);
    });
    
    describe('GET /history - create item and transaction, get user history', () => {
        it('expect success HTTP 200 status', (done) => {
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