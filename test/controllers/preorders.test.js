const supertest = require('supertest');
const app = require('../../app');
const dbUtil = require('../../db/db-util.js');
const ItemService = require('../../services/item-service');
const PreorderService = require('../../services/preorder-service');
const testUtil = require('../util/test-util');
require('dotenv').config();

describe('Preorder Routes - Preorder Management Workflow', () => {
    describe('GET /preorders - get all preorders', () => {
        it('expect success HTTP 200 status', (done) => {
            dbUtil.dropTables().then(() => {
            dbUtil.createTables().then(() => {
            dbUtil.initAdmin().then(() => {
                ItemService.createItem('chicken', '', '', 5).then(() => {
                    PreorderService.createPreorder(1, 1, testUtil.userAuthHeaders.uid).then(() => {
                        supertest(app).get('/preorders')
                        .set(testUtil.adminAuthHeaders)
                        .expect(200, done);
                    });
                });
            })
            })
            })
            .catch((err) => {
                done(err);
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