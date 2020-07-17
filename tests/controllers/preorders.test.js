const supertest = require('supertest'),
    app = require('../../app'),
    dbUtil = require('../../db/db-util.js'),
    ItemService = require('../../services/item-service'),
    PreorderService = require('../../services/preorder-service'),
    testUtil = require('../util/test-util');

require('dotenv').config();

describe('Preorder Routes - Preorder Management Workflow', () => {
    before(async () => {
        await ItemService.deleteAllItems();
        await dbUtil.preTestSetup();
        const item = await ItemService.createItem('chicken', '', '', 5);
        await PreorderService.createPreorder([{ id: item.get('id'), quantity: 1 }], testUtil.userAuthHeaders.uid);
        await PreorderService.createPreorder([{ id: item.get('id'), quantity: 1 }], testUtil.userAuthHeaders.uid);
    });

    describe('GET /preorders - get all preorders', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/preorders')
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('POST /preorders/complete - complete a preorder', () => {
        it('expect success HTTP 200 status', (done) => {
            const requestBody = {
                id: 1
            };
            supertest(app).post('/preorders/complete')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(200, done);
        });
    });

    describe('POST /preorders/cancel - cancel a preorder', () => {
        it('expect success HTTP 200 status', (done) => {
            const requestBody = {
                id: 2
            };
            supertest(app).post('/preorders/cancel')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(200, done);
        });
    });
});