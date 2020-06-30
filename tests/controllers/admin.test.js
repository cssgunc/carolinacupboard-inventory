const supertest = require('supertest'),
    app = require('../../app'),
    dbUtil = require('../../db/db-util.js'),
    testUtil = require('../util/test-util');

require('dotenv').config();

const CSV_SUCCESS_MESSAGE = /Success!/,
    CSV_FAIL_MESSAGE = /An error occurred with the CSV file/,
    CSV_FILETYPE_MESSAGE = /Please upload a valid CSV file/,
    CSV_NOFILE_MESSAGE = /Please select a CSV file to upload/;

describe('Admin Routes - GET pages', () => {
    before(async () => {
        await dbUtil.dropTables(false);
        await dbUtil.createTables(false);
        await dbUtil.initAdmin(false);
    });
    
    describe('GET /admin - admin main page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/users - all volunteers and admins', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/users')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/history - transaction history', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/history')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/users/import - volunteers import page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/users/import')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/backup - backup and delete data', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/backup')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/backup/items.csv - backup items table', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/backup/items.csv')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/backup/transactions.csv - backup transactions table', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/backup/transactions.csv')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/backup/volunteers.csv - backup volunteers table', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/backup/volunteers.csv')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/database - database factory reset page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/database')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .expect(200, done);
        });
    });
});

describe('Admin Routes - Sanity Checks', () => {
    describe('POST /admin/users/edit - change PREORDER admin to volunteer', () => {
        it('expect HTTP 403 status', (done) => {
            let requestBody = {
                onyen: 'PREORDER',
                type: 'volunteer'
            };
            supertest(app).post('/admin/users/edit')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(403, done);
        });
    });

    describe('POST /admin/users/delete - delete PREORDER admin', () => {
        it('expect HTTP 403 status', (done) => {
            let requestBody = {
                onyen: 'PREORDER',
            };
            supertest(app).post('/admin/users/delete')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(403, done);
        });
    });

    describe('POST /admin/users/edit - change last remaining admin to volunteer', () => {
        it('expect HTTP 500 status', (done) => {
            let requestBody = {
                onyen: process.env.DEFAULT_ADMIN,
                type: 'volunteer'
            };
            supertest(app).post('/admin/users/edit')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(500, done);
        });
    });

    describe('POST /admin/users/delete - delete last remaining admin', () => {
        it('expect HTTP 500 status', (done) => {
            let requestBody = {
                onyen: process.env.DEFAULT_ADMIN,
            };
            supertest(app).post('/admin/users/delete')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(500, done);
        });
    });
});

describe('Admin Routes - Volunteer Management Workflow', () => {
    describe('POST /admin/users/create - create new admin', () => {
        it('expect success HTTP 302 status', (done) => {
            let requestBody = {
                onyen: 'admin',
                type: 'admin'
            }
            supertest(app).post('/admin/users/create')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(302, done);
        });
    });

    describe('POST /admin/users/edit - change newly created admin to volunteer', () => {
        it('expect success HTTP 302 status', (done) => {
            let requestBody = {
                onyen: 'admin',
                type: 'volunteer'
            };
            supertest(app).post('/admin/users/edit')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(302, done);
        });
    });

    describe('POST /admin/users/delete - delete newly created admin', () => {
        it('expect success HTTP 302 status', (done) => {
            let requestBody = {
                onyen: 'admin'
            };
            supertest(app).post('/admin/users/delete')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(302, done);
        });
    });

    describe('POST /admin/users/create - create new volunteer', () => {
        it('expect success HTTP 302 status', (done) => {
            let requestBody = {
                onyen: 'volunteer',
                type: 'volunteer'
            };
            supertest(app).post('/admin/users/create')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(302, done);
        });
    });

    describe('POST /admin/users/edit - change newly created volunteer to admin', () => {
        it('expect success HTTP 302 status', (done) => {
            let requestBody = {
                onyen: 'volunteer',
                type: 'admin'
            };
            supertest(app).post('/admin/users/edit')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(302, done);
        });
    });

    describe('POST /admin/users/edit - change newly created volunteer to invalid role', () => {
        it('expect http 500 status', (done) => {
            let requestBody = {
                onyen: 'volunteer',
                type: 'invalidRole'
            };
            supertest(app).post('/admin/users/edit')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(500, done);
        });
    });

    describe('POST /admin/users/delete - delete newly created volunteer', () => {
        it('expect success HTTP 302 status', (done) => {
            let requestBody = {
                onyen: 'volunteer'
            };
            supertest(app).post('/admin/users/delete')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(302, done);
        });
    });

    describe('POST /admin/users/create - create new volunteer with invalid role', () => {
        it('expect http 500 status', (done) => {
            let requestBody = {
                onyen: 'volunteer',
                type: 'invalidRole'
            };
            supertest(app).post('/admin/users/create')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .send(requestBody)
                .expect(500, done);
        });
    });
});

describe('Admin Routes - Import CSV', () => {
    describe('POST /admin/users/import - upload volunteers CSV with headers', () => {
        it('expect success HTTP 200 status and success message in return body', (done) => {
            const filePath = 'tests/_files/testVolunteersHeaders.csv'
            supertest(app).post('/admin/users/import')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .attach('file', filePath)
                .expect(200)
                .expect((res) => testUtil.matchResponseText(res, CSV_SUCCESS_MESSAGE)) // checks for success message in response html body
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

    describe('POST /admin/users/import - upload volunteers CSV without headers', () => {
        it('expect success HTTP 200 status and success message in return body', (done) => {
            const filePath = 'tests/_files/testVolunteersNoHeaders.csv'
            supertest(app).post('/admin/users/import')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .attach('file', filePath)
                .expect(200)
                .expect((res) => testUtil.matchResponseText(res, CSV_SUCCESS_MESSAGE)) // checks for success message in response html body
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

    describe('POST /admin/users/import - upload invalid volunteers CSV', () => {
        it('expect success HTTP 200 status and faliure message in return body', (done) => {
            const filePath = 'tests/_files/testVolunteersInvalid.csv'
            supertest(app).post('/admin/users/import')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .attach('file', filePath)
                .expect(200)
                .expect((res) => testUtil.matchResponseText(res, CSV_FAIL_MESSAGE)) // checks for fail message in response html body
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

    describe('POST /admin/users/import - upload non CSV file', () => {
        it('expect success HTTP 200 status and faliure message in return body', (done) => {
            const filePath = 'tests/_files/test.txt'
            supertest(app).post('/admin/users/import')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .attach('file', filePath)
                .expect(200)
                .expect((res) => testUtil.matchResponseText(res, CSV_FILETYPE_MESSAGE)) // checks for fail message in response html body
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

    describe('POST /admin/users/import - upload no file', () => {
        it('expect success HTTP 200 status and faliure message in return body', (done) => {
            supertest(app).post('/admin/users/import')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .expect(200)
                .expect((res) => testUtil.matchResponseText(res, CSV_NOFILE_MESSAGE)) // checks for fail message in response html body
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

describe('Admin Routes - Delete Tables', () => {
    describe('POST /admin/delete/items/all - delete all items', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).post('/admin/delete/items/all')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .expect(200, done)
        });
    });

    describe('POST /admin/delete/items/outofstock - delete out of stock items', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).post('/admin/delete/items/outofstock')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .expect(200, done)
        });
    });

    describe('POST /admin/delete/transactions - delete all transactions', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).post('/admin/delete/transactions')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .expect(200, done)
        });
    });

    describe('POST /admin/delete/users - delete all users', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).post('/admin/delete/users')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .expect(200)
                .end(async (err, res) => {
                    await dbUtil.dropTables(false);
                    await dbUtil.createTables(false);
                    await dbUtil.initAdmin(false);
                    if (err) done(err);
                    else done();
                });
        });
    });

    describe('POST /admin/database - drop and reinitialize all tables', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).post('/admin/database')
                .set(testUtil.commonHeaders)
                .set(testUtil.adminAuthHeaders)
                .expect(200, done)
        });
    });
});

describe('Admin Routes - Not Authorized', () => {
    describe('GET /admin - admin main page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/users - all volunteers and admins', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/users')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/users/create - create volunteer', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/users/create')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/users/edit - edit volunteer', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/users/edit')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/users/delete - delete volunteer', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/users/delete')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/history - transaction history', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/history')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/users/import - import volunteer CSV page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/users/import')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/users/import - upload volunteer CSV', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/users/import')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/backup - backup and delete tables page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/backup')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/backup/items.csv - backup items table', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/backup/items.csv')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/backup/transactions.csv - backup transactions table', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/backup/transactions.csv')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/backup/volunteers.csv - backup volunteers table', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/backup/volunteers.csv')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/delete/items/all - delete all items', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/delete/items/all')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/delete/items/outofstock - delete outofstock items', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/delete/items/outofstock')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/delete/transactions - delete all transactions', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/delete/transactions')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/delete/users - delete all users', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/delete/users')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/database - database factory reset page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/database')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/database - factory reset', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/database')
                .set(testUtil.commonHeaders)
                .set(testUtil.volunteerAuthHeaders)
                .expect(403, done);
        });
    });
});