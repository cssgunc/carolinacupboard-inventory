const supertest = require('supertest'),
    app = require('../../app'),
    dbUtil = require('../../db/db-util.js'),
    ItemService = require('../../services/item-service'),
    PreorderService = require('../../services/preorder-service'),
    testUtil = require('../util/test-util');

require('dotenv').config();

describe('Preorder Routes - Preorder Management Workflow', () => {
    before(async () => {
        await dbUtil.dropTables(false);
        await dbUtil.createTables(false);
        await dbUtil.initAdmin(false);
    });
    describe('GET /preorders - get all preorders', () => {
        it('expect success HTTP 200 status', (done) => {
            ItemService.createItem('chicken', '', '', 5).then(() => {
                PreorderService.createPreorder(1, 1, testUtil.userAuthHeaders.uid).then(() => {
                    supertest(app).get('/preorders')
                        .set(testUtil.adminAuthHeaders)
                        .expect(200, done);
                });
            });
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
            PreorderService.createPreorder(1, 1, testUtil.userAuthHeaders.uid).then(() => {
                const requestBody = {
                    id: 2
                };
                supertest(app).post('/preorders/cancel')
                    .set(testUtil.adminAuthHeaders)
                    .send(requestBody)
                    .expect(200, done);
            }).catch((err) => {
                done(err);
            });;
        });
    });
});