const supertest = require('supertest');
const should = require('should');
const app = require('../../app');
const dbUtil = require('../../db/db-util.js');
const ItemService = require('../../services/item-service');
require('dotenv').config();

const userAuthHeaders = {
    uid: "userOnyen"
};

// Checks response body for a match to the fail message on invalid CSV import
let matchResponseText = (res, pattern) => {
    res.text.should.match(pattern);
}

describe('Items Routes - Item Preorder Workflow', () => {
    describe('GET /items - items main page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/items')
                .set(userAuthHeaders)
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
                    .set(userAuthHeaders)
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
                .set(userAuthHeaders)
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