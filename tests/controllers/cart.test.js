const supertest = require('supertest'),
    app = require('../../app'),
    ItemService = require('../../services/item-service'),
    dbUtil = require('../../db/db-util.js'),
    testUtil = require('../util/test-util');

require('dotenv').config();

const CHECKOUT_SUCCESS_MESSAGE = /Your preorder has been successfully placed/;
const CHECKOUT_ERROR_MESSAGE = /error occurred/;
const CHECKOUT_TOOMANY_MESSAGE = /more than the quantity in the system/;

var itemId = ''; 

describe('Cart Routes - GET pages', () => {
    before(async () => {
        await dbUtil.preTestSetup();
    });
    
    describe('GET /cart - get cart page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/cart')
                .set(testUtil.userAuthHeaders)
                .expect(200, done);
        });
    });
});

describe('Cart Routes - checkout', () => {
    before(async () => {
        await dbUtil.preTestSetup();
        await ItemService.createItem('chicken', '', '', 5);
        itemId = (await ItemService.getAllItems())[0].get('id');
    });
    
    describe('POST /cart - checkout valid cart', () => {
        it('expect success HTTP 200 status with success message', (done) => {
            const requestBody = {
                cart: JSON.stringify([{
                    id: itemId,
                    quantity: 1
                }])
            };
            supertest(app).post('/cart')
                .set(testUtil.userAuthHeaders)
                .send(requestBody)
                .expect((res) => testUtil.matchResponseText(res, CHECKOUT_SUCCESS_MESSAGE))
                .expect(200, done);
        });
    });

    describe('POST /cart - checkout too many', () => {
        it('expect success HTTP 200 status with error message', (done) => {
            const requestBody = {
                cart: JSON.stringify([{
                    id: itemId,
                    quantity: 100
                }])
            };
            supertest(app).post('/cart')
                .set(testUtil.userAuthHeaders)
                .send(requestBody)
                .expect((res) => testUtil.matchResponseText(res, CHECKOUT_TOOMANY_MESSAGE))
                .expect(200, done);
        });
    });

    describe('POST /cart - checkout item doesn\'t exist', () => {
        it('expect success HTTP 200 status with error message', (done) => {
            const requestBody = {
                cart: JSON.stringify([{
                    id: 4,
                    quantity: 100
                }])
            };
            supertest(app).post('/cart')
                .set(testUtil.userAuthHeaders)
                .send(requestBody)
                .expect((res) => testUtil.matchResponseText(res, CHECKOUT_ERROR_MESSAGE))
                .expect(200, done);
        });
    });
});