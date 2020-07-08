const supertest = require('supertest'),
    app = require('../../app'),
    dbUtil = require('../../db/db-util.js'),
    testUtil = require('../util/test-util');

require('dotenv').config();

const MANUAL_CREATE_SUCCESS = /New item successfully created, id:/,
    ITEM_FOUND_MESSAGE = /Item already found in database, do you want to update this entry/,
    MANUAL_UPDATE_SUCCESS = /Item successfully updated/,
    MANUAL_UPDATE_ERROR = /Error updating item/,
    SUCCESS_QUERY_PARAM = /success=1/,
    ERROR_QUERY_PARAM = /success=0/,
    CSV_SUCCESS_MESSAGE = /Success!/,
    CSV_FAIL_MESSAGE = /An error occurred with the CSV file/,
    CSV_FILETYPE_MESSAGE = /Please upload a valid CSV file/,
    CSV_NOFILE_MESSAGE = /Please select a CSV file to upload/;

describe('Entry Routes - GET pages', () => {
    before(async () => {
        await dbUtil.preTestSetup(false);
    });
    
    describe('GET /entry - entry main page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/entry')
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /entry/search - search entry page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/entry/search')
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /entry/manual - manual entry page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/entry/manual')
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /entry/manual - manual entry page, update success', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/entry/manual')
                .set(testUtil.adminAuthHeaders)
                .query({ success: '1' })
                .expect((res) => testUtil.matchResponseText(res, MANUAL_UPDATE_SUCCESS))
                .expect(200, done);
        });
    });

    describe('GET /entry/manual - manual entry page, update error', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/entry/manual')
                .set(testUtil.adminAuthHeaders)
                .query({ success: '0' })
                .expect((res) => testUtil.matchResponseText(res, MANUAL_UPDATE_ERROR))
                .expect(200, done);
        });
    });

    describe('GET /entry/import - items CSV import page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/entry/import')
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });
});

describe('Entry Routes - Entry Workflow', () => {
    describe('POST /entry/search - search for item by name', () => {
        it('expect success HTTP 200 status', (done) => {
            let requestBody = {
                searchTerm: 'chicken',
                barcode: ''
            };
            supertest(app).post('/entry/search')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(200, done);
        });
    });

    describe('POST /entry/search - search for item by barcode', () => {
        it('expect success HTTP 200 status', (done) => {
            let requestBody = {
                searchTerm: '',
                barcode: '123456789012'
            };
            supertest(app).post('/entry/search')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(200, done);
        });
    });

    describe('POST /entry/manual - create a new item', () => {
        it('expect success HTTP 200 status', (done) => {
            let requestBody = {
                name: 'chicken',
                barcode: '123456789012',
                description: 'meaty',
                count: 1
            };
            supertest(app).post('/entry/manual')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect((res) => testUtil.matchResponseText(res, MANUAL_CREATE_SUCCESS))
                .expect(200, done);
        });
    });

    describe('POST /entry/manual - attempt to create existing item', () => {
        it('expect success HTTP 200 status', (done) => {
            let requestBody = {
                name: 'chicken',
                barcode: '123456789012',
                description: 'meaty',
                count: 1
            };
            supertest(app).post('/entry/manual')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect((res) => testUtil.matchResponseText(res, ITEM_FOUND_MESSAGE))
                .expect(200, done);
        });
    });

    describe('POST /entry/manual - attempt to create existing item, no barcode', () => {
        it('expect success HTTP 200 status', (done) => {
            let requestBody = {
                name: 'chicken',
                description: 'meaty',
                count: 1
            };
            supertest(app).post('/entry/manual')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect((res) => testUtil.matchResponseText(res, ITEM_FOUND_MESSAGE))
                .expect(200, done);
        });
    });

    describe('POST /entry/manual/update - manually add count to existing item', () => {
        it('expect success HTTP 302 status', (done) => {
            let requestBody = {
                id: 1,
                quantity: 5
            };
            supertest(app).post('/entry/manual/update')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect((res) => testUtil.matchResponseText(res, SUCCESS_QUERY_PARAM))
                .expect(302, done);
        });
    });

    describe('POST /entry/manual/update - manually remove count from existing item', () => {
        it('expect success HTTP 302 status', (done) => {
            let requestBody = {
                id: 1,
                quantity: -1
            };
            supertest(app).post('/entry/manual/update')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect((res) => testUtil.matchResponseText(res, SUCCESS_QUERY_PARAM))
                .expect(302, done);
        });
    });

    describe('POST /entry/manual/update - manually add count to existing item, invalid quantity', () => {
        it('expect success HTTP 302 status', (done) => {
            let requestBody = {
                id: 1,
                quantity: -100
            };
            supertest(app).post('/entry/manual/update')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect((res) => testUtil.matchResponseText(res, ERROR_QUERY_PARAM))
                .expect(302, done);
        });
    });

    describe('POST /entry/manual/update - manually add count to existing item, non-number quantity', () => {
        it('expect success HTTP 302 status', (done) => {
            let requestBody = {
                id: 1,
                quantity: "test"
            };
            supertest(app).post('/entry/manual/update')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect((res) => testUtil.matchResponseText(res, ERROR_QUERY_PARAM))
                .expect(302, done);
        });
    });

    describe('POST /entry/edit - edit an item from the search page', () => {
        it('expect success HTTP 302 status', (done) => {
            let requestBody = {
                id: 1,
                name: 'newname',
                barcode: '1234567890',
                description: 'newname'
            };
            supertest(app).post('/entry/edit')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(302, done);
        });
    });

    describe('POST /entry/add - add from search entry page', () => {
        it('expect success HTTP 302 status', (done) => {
            let requestBody = {
                id: 1,
                count: 1,
            };
            supertest(app).post('/entry/add')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(302, done);
        });
    });

    describe('POST /entry/remove - remove from search entry page, existing user', () => {
        it('expect success HTTP 302 status', (done) => {
            let requestBody = {
                id: 1,
                count: 1,
                onyen: testUtil.userAuthHeaders.uid
            };
            supertest(app).post('/entry/remove')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(302, done);
        });
    });

    describe('POST /entry/remove - remove from search entry page, new user', () => {
        it('expect success HTTP 200 status', (done) => {
            let requestBody = {
                id: 1,
                count: 1,
                onyen: 'onyen'
            };
            supertest(app).post('/entry/remove')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(200, done);
        });
    });

    describe('POST /entry/remove/update - volunteer update info for a new user', () => {
        it('expect success HTTP 200 status', (done) => {
            let requestBody = {
                onyen: 'onyen',
                pid: '999999999',
                email: 'onyen@onyen.com'
            };
            supertest(app).post('/entry/remove/update')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(302, done);
        });
    });

    describe('POST /entry/remove/update - volunteer update info for a new user, missing pid and email', () => {
        it('expect success HTTP 200 status', (done) => {
            let requestBody = {
                onyen: 'onyen',
            };
            supertest(app).post('/entry/remove/update')
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(200, done);
        });
    });
});

describe('Entry Routes - Import CSV', () => {
    describe('POST /entry/import - upload items CSV short format', () => {
        it('expect success 200 status and success message in request body', (done) => {
            const filePath = 'tests/_files/testItemsShort.csv'
            supertest(app).post('/entry/import')
                .set(testUtil.adminAuthHeaders)
                .attach('file', filePath)
                .expect((res) => testUtil.matchResponseText(res, CSV_SUCCESS_MESSAGE)) // checks for success message in response html body
                .expect(200)
                .end(async (err, res) => {
                    // Clear imported volunteers
                    await dbUtil.preTestSetup(false);
                    if (err) done(err);
                    else done();
                });
        });
    });

    describe('POST /entry/import - upload items CSV long format', () => {
        it('expect success 200 status and success message in request body', (done) => {
            const filePath = 'tests/_files/testItemsLong.csv'
            supertest(app).post('/entry/import')
                .set(testUtil.adminAuthHeaders)
                .attach('file', filePath)
                .expect((res) => testUtil.matchResponseText(res, CSV_SUCCESS_MESSAGE)) // checks for success message in response html body
                .expect(200)
                .end(async (err, res) => {
                    // Clear imported volunteers
                    await dbUtil.preTestSetup(false);
                    if (err) done(err);
                    else done();
                });
        });
    });

    describe('POST /entry/import - upload invalid items CSV', () => {
        it('expect success 200 status and error message in request body', (done) => {
            const filePath = 'tests/_files/testItemsInvalid.csv'
            supertest(app).post('/entry/import')
                .set(testUtil.adminAuthHeaders)
                .attach('file', filePath)
                .expect((res) => testUtil.matchResponseText(res, CSV_FAIL_MESSAGE)) // checks for success message in response html body
                .expect(200)
                .end(async (err, res) => {
                    // Clear imported volunteers
                    await dbUtil.preTestSetup(false);
                    if (err) done(err);
                    else done();
                });
        });
    });

    describe('POST /entry/import - invalid filetype for CSV upload', () => {
        it('expect success 200 status and filetype error message in request body', (done) => {
            const filePath = 'tests/_files/test.txt'
            supertest(app).post('/entry/import')
                .set(testUtil.adminAuthHeaders)
                .attach('file', filePath)
                .expect((res) => testUtil.matchResponseText(res, CSV_FILETYPE_MESSAGE)) // checks for success message in response html body
                .expect(200)
                .end(async (err, res) => {
                    // Clear imported volunteers
                    await dbUtil.preTestSetup(false);
                    if (err) done(err);
                    else done();
                });
        });
    });

    describe('POST /entry/import - no file attached for CSV upload', () => {
        it('expect success 200 status and no file message in request body', (done) => {
            supertest(app).post('/entry/import')
                .set(testUtil.adminAuthHeaders)
                .expect((res) => testUtil.matchResponseText(res, CSV_NOFILE_MESSAGE)) // checks for success message in response html body
                .expect(200)
                .end(async (err, res) => {
                    // Clear imported volunteers
                    await dbUtil.preTestSetup(false);
                    if (err) done(err);
                    else done();
                });
        });
    });
});

describe('Entry Routes - Not Authorized', () => {
    describe('GET /entry - entry main page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/entry')
                .set(testUtil.userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /entry/search - search entry page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/entry/search')
                .set(testUtil.userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /entry/search - search for item', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/entry/search')
                .set(testUtil.userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /entry/manual - manual entry page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/entry/manual')
                .set(testUtil.userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /entry/manual - manually create new item', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/entry/manual')
                .set(testUtil.userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /entry/manual/update - manually update existing item', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/entry/manual/update')
                .set(testUtil.userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /entry/add - create an add transaction', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/entry/add')
                .set(testUtil.userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /entry/remove - create a remove transaction', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/entry/remove')
                .set(testUtil.userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /entry/import - items CSV import page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/entry/import')
                .set(testUtil.userAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /entry/import - upload items CSV', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/entry/import')
                .set(testUtil.userAuthHeaders)
                .expect(403, done);
        });
    });
});