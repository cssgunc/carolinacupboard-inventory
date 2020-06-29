const supertest = require('supertest');
const should = require('should');
const app = require('../../app');
const dbUtil = require('../../db/db-util.js')
require('dotenv').config()

const adminAuthHeaders = {
    uid: process.env.DEFAULT_ADMIN
};
const volunteerAuthHeaders = {
    uid: 'volunteerOnyen'
};
const userAuthHeaders = {
    uid: "userOnyen"
};

// Checks response body for a match to the fail message on invalid CSV import
let matchResponseText = (res, pattern) => {
    res.text.should.match(pattern);
}

describe('Entry Routes - GET pages', () => {
    describe('GET /entry - entry main page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/entry')
                .set(adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /entry/search - search entry page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/entry/search')
                .set(adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /entry/manual - manual entry page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/entry/manual')
                .set(adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /entry/import - items CSV import page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/entry/import')
                .set(adminAuthHeaders)
                .expect(200, done);
        });
    });
});

describe('Entry Routes - Not Authorized', () => {
    describe('GET /entry - entry main page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/entry')
                .set(userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /entry/search - search entry page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/entry/search')
                .set(userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /entry/search - search for item', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/entry/search')
                .set(userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /entry/manual - manual entry page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/entry/manual')
                .set(userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /entry/manual - manually create new item', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/entry/manual')
                .set(userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /entry/manual/update - manually update existing item', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/entry/manual/update')
                .set(userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /entry/add - create an add transaction', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/entry/add')
                .set(userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /entry/remove - create a remove transaction', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/entry/remove')
                .set(userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /entry/found - scanned item found in Datakick', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/entry/found')
                .set(userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /entry/import - items CSV import page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/entry/import')
                .set(userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /entry/import - upload items CSV', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/entry/import')
                .set(userAuthHeaders)
                .expect(403, done);
        });
    });
});