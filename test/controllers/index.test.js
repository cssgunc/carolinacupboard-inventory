const supertest = require('supertest');
const should = require('should');
const app = require('../../app');
const dbUtil = require('../../db/db-util.js')
require('dotenv').config()

const adminAuthHeaders = {
    uid: process.env.DEFAULT_ADMIN
};

describe('Index routes - GET pages', () => {
    describe('GET / - home page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/')
                .set(adminAuthHeaders)
                .expect(200, done);
        });
    });
});