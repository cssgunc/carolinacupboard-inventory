const supertest = require('supertest');
const should = require('should');
const app = require('../../app');
const dbUtil = require('../../db/db-util.js')
require('dotenv').config()

const commonHeaders = {};
const adminAuthHeaders = {
    uid: process.env.DEFAULT_ADMIN
};
const volunteerAuthHeaders = {
    uid: 'volunteerOnyen'
};
const CSV_SUCCESS_MESSAGE = /Success!/;
const CSV_FAIL_MESSAGE = /An error occurred with the CSV file/;
const CSV_FILETYPE_MESSAGE = /Please upload a valid CSV file/;
const CSV_NOFILE_MESSAGE = /Please select a CSV file to upload/;

// Checks response body for a match to the fail message on invalid CSV import
let matchResponseText = (res, pattern) => {
    res.text.should.match(pattern);
}

describe('Admin Routes - GET pages', () => {
    describe('GET /admin - admin main page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin')
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/users - all volunteers and admins', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/users')
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/history - transaction history', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/history')
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/users/import - volunteers import page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/users/import')
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/backup - backup and delete data', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/backup')
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/backup/items.csv - backup items table', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/backup/items.csv')
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/backup/transactions.csv - backup transactions table', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/backup/transactions.csv')
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/backup/volunteers.csv - backup volunteers table', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/backup/volunteers.csv')
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .expect(200, done);
        });
    });

    describe('GET /admin/database - database factory reset page', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).get('/admin/database')
                .set(commonHeaders)
                .set(adminAuthHeaders)
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
                .set(commonHeaders)
                .set(adminAuthHeaders)
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
                .set(commonHeaders)
                .set(adminAuthHeaders)
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
                .set(commonHeaders)
                .set(adminAuthHeaders)
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
                .set(commonHeaders)
                .set(adminAuthHeaders)
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
                .set(commonHeaders)
                .set(adminAuthHeaders)
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
                .set(commonHeaders)
                .set(adminAuthHeaders)
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
                .set(commonHeaders)
                .set(adminAuthHeaders)
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
                .set(commonHeaders)
                .set(adminAuthHeaders)
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
                .set(commonHeaders)
                .set(adminAuthHeaders)
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
                .set(commonHeaders)
                .set(adminAuthHeaders)
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
                .set(commonHeaders)
                .set(adminAuthHeaders)
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
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .send(requestBody)
                .expect(500, done);
        });
    });
});

describe('Admin Routes - Import CSV', () => {
    describe('POST /admin/users/import - upload volunteers CSV with headers', () => {
        it('expect success HTTP 200 status and success message in return body', (done) => {
            const filePath = 'test/_files/testVolunteersHeaders.csv'
            supertest(app).post('/admin/users/import')
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .attach('file', filePath)
                .expect(200)
                .expect((res) => matchResponseText(res, CSV_SUCCESS_MESSAGE)) // checks for success message in response html body
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
            const filePath = 'test/_files/testVolunteersNoHeaders.csv'
            supertest(app).post('/admin/users/import')
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .attach('file', filePath)
                .expect(200)
                .expect((res) => matchResponseText(res, CSV_SUCCESS_MESSAGE)) // checks for success message in response html body
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
            const filePath = 'test/_files/testVolunteersInvalid.csv'
            supertest(app).post('/admin/users/import')
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .attach('file', filePath)
                .expect(200)
                .expect((res) => matchResponseText(res, CSV_FAIL_MESSAGE)) // checks for fail message in response html body
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
            const filePath = 'test/_files/test.txt'
            supertest(app).post('/admin/users/import')
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .attach('file', filePath)
                .expect(200)
                .expect((res) => matchResponseText(res, CSV_FILETYPE_MESSAGE)) // checks for fail message in response html body
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
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .expect(200)
                .expect((res) => matchResponseText(res, CSV_NOFILE_MESSAGE)) // checks for fail message in response html body
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
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .expect(200, done)
        });
    });

    describe('POST /admin/delete/items/outofstock - delete out of stock items', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).post('/admin/delete/items/outofstock')
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .expect(200, done)
        });
    });

    describe('POST /admin/delete/transactions - delete all transactions', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).post('/admin/delete/transactions')
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .expect(200, done)
        });
    });

    describe('POST /admin/delete/users - delete all users', () => {
        it('expect success HTTP 200 status', (done) => {
            supertest(app).post('/admin/delete/users')
                .set(commonHeaders)
                .set(adminAuthHeaders)
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
                .set(commonHeaders)
                .set(adminAuthHeaders)
                .expect(200, done)
        });
    });
});

describe('Admin Routes - Not Authorized', () => {
    describe('GET /admin - admin main page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/users - all volunteers and admins', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/users')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/users/create - create volunteer', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/users/create')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/users/edit - edit volunteer', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/users/edit')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/users/delete - delete volunteer', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/users/delete')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/history - transaction history', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/history')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/users/import - import volunteer CSV page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/users/import')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/users/import - upload volunteer CSV', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/users/import')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/backup - backup and delete tables page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/backup')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/backup/items.csv - backup items table', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/backup/items.csv')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/backup/transactions.csv - backup transactions table', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/backup/transactions.csv')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/backup/volunteers.csv - backup volunteers table', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/backup/volunteers.csv')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/delete/items/all - delete all items', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/delete/items/all')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/delete/items/outofstock - delete outofstock items', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/delete/items/outofstock')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/delete/transactions - delete all transactions', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/delete/transactions')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/delete/users - delete all users', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/delete/users')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('GET /admin/database - database factory reset page', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).get('/admin/database')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });

    describe('POST /admin/database - factory reset', () => {
        it('expect HTTP 403 status', (done) => {
            supertest(app).post('/admin/database')
                .set(commonHeaders)
                .set(volunteerAuthHeaders)
                .expect(403, done);
        });
    });
});