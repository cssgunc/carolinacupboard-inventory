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

    describe('POST /items/add - Preorder an item', () => {
        it('expect success HTTP 200 status', (done) => {
            ItemService.createItem('chicken', '', '', 5).then(() => {
                const requestBody = {
                    id: 1,
                    name: 'chicken',
                    quantity: 5
                };
                supertest(app).post('/items/add')
                    .set(testUtil.userAuthHeaders)
                    .send(requestBody)
                    .expect(200, done);
            });
        });
    });

    // TODO check error message
    describe('POST /items/add - Preorder an item, too many', () => {
        it('expect success HTTP 200 status', (done) => {
            const requestBody = {
                id: 1,
                name: 'chicken',
                quantity: 5
            };
            supertest(app).post('/items/add')
                .set(testUtil.userAuthHeaders)
                .send(requestBody)
                .expect(200, done);
        });
    });
});