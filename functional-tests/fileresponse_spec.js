if (!global.Promise) {
  global.Promise = require('q');
}

var chai = require('chai')
  , chaiHttp = require('chai-http');

var rewire = require('rewire'),
   cli = rewire(".././index").__get__("cli");

 chai.use(chaiHttp);

try{
    cli(["node", "stubmatic", "-d","functional-tests/assets"/*, "-v"*/]);
}catch(err){
    console.log(err);
}

describe('FT', function () {

    it('should response with dynamic file data', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/id-1/name-amit')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("id: 1; name: amit");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response with dynamic file data', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/id-2/name-nushi')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("This is from another file nushi");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('strategy: should response from second file', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/not-found')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("Sample File contents");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response from random file if exist otherwise 500 if file is not exist', function (done) {
        //already covered in unit tests
        chai.request("http://localhost:9999")
            .get('/stubs/random')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toMatch("(id: 1; name: <% url.2 %>)|(Sample File contents)|(file 3)");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response from next file in round robin fashion', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/round-robin')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("id: 1; name: <% url.2 %>");
            }).catch( err => {
                markFailed(err,fail,done);
            });
        
        chai.request("http://localhost:9999")
            .get('/stubs/round-robin')
            .then(res => {
                fail("successful response is not expected");
            }).catch( err => {
                //expect(res.status).toBe(500);
            });
        
        chai.request("http://localhost:9999")
            .get('/stubs/round-robin')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("file 3");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response from next file exist in round robin fashion', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/round-robin-first-found')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("id: 1; name: <% url.2 %>");
            }).catch( err => {
                markFailed(err,fail,done);
            });
        
        chai.request("http://localhost:9999")
            .get('/stubs/round-robin-first-found')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("file 3");
            }).catch( err => {
                markFailed(err,fail,done);
            });
        
        chai.request("http://localhost:9999")
            .get('/stubs/round-robin-first-found')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("id: 1; name: <% url.2 %>");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response from next file exist in round robin fashion', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/random-first-found')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toMatch("(id: 1; name: <% url.2 %>)|(file 3)");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

});

function markFailed(err,fail,done){
    if(err.status === 404)
        fail("No matching mapping found");
    else
        fail(err.message);
    done();
}