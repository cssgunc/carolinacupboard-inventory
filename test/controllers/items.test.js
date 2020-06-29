const supertest = require('supertest');
const app = require('../../app');
const dbUtil = require('../../db/db-util.js');
const ItemService = require('../../services/item-service');
const testUtil = require('../util/test-util');
require('dotenv').config();


describe('Items Routes - Item Preorder Workflow', () => {
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