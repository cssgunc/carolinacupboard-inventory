var server   = require('../server'),
    chai     = require('chai'),
    chaiHttp = require('chai-http'),
    should   = chai.should();

chai.use(chaiHttp);

describe('Basic routes tests', function() {

    it('GET to / should return 200', function(done){
        chai.request(server)
        .get('/')
        .end(function(err, res) {
            res.should.have.status(200);
            done();
        })

    })

    it('GET to /pagecount should return 200', function(done){
        chai.request(server)
        .get('/pagecount')
        .end(function(err, res) {
            res.should.have.status(200);
            done();
        })

    })
})
