/**
 * modella-resource tests
 */

var express = require('express')
  , resource = require('..')
  , modella = require('modella')
  , should = require('should')
  , request = require('superagent');

describe('module', function() {
  var serverPort = process.env.MODELLA_EXPRESS_TEST_SERVER_PORT || 6001;
  var serverUrl = 'http://localhost:' + serverPort;
  var app = express();
  User = modella('User').attr('id').attr('name');
  User.base = '/users';
  app.use(express.bodyParser());

  it('exports middleware', function(done) {
    should.exist(resource);
    resource.should.be.a('function');
    var middleware = resource(User).middleware();
    should.exist(middleware);
    middleware.should.be.a('function');
    app.use(middleware);
    app.listen(serverPort);
    done();
  });

  describe('resource.index()', function() {
    it('responds to GET /users', function(done) {
      User.all = function(query, callback) {
        callback(null, []);
      };
      request
        .get(serverUrl + '/users')
        .set('Accept', 'application/json')
        .end(function(res) {
          if (res.error) return done(res.error);
          done();
        });
    });

    it('passes error along to callback', function(done) {
      User.all = function(query, callback) {
        callback(new Error("uh oh"));
      };
      request
        .get(serverUrl + '/users')
        .set('Accept', 'application/json')
        .end(function(res) {
          res.error.should.not.equal(false);
          done();
        });
    });
  });

  describe('resource.count()', function(done) {
    it('responds to GET /users/count', function(done) {
      User.count = function(query, callback) {
        callback();
      };
      request
        .get(serverUrl + '/users/count')
        .set('Accept', 'application/json')
        .end(function(res) {
          if (res.error) return done(res.error);
          done();
        });
    });

    it('passes error along to callback', function(done) {
      User.count = function(query, callback) {
        callback(new Error("uh oh"));
      };
      request
        .get(serverUrl + '/users/count')
        .set('Accept', 'application/json')
        .end(function(res) {
          res.error.should.not.equal(false);
          done();
        });
    });
  });

  describe('resource.show()', function(done) {
    it('responds to GET /users/123', function(done) {
      User.find = function(id, callback) {
        callback(null, { id: 123, name: "bob" });
      };
      request
        .get(serverUrl + '/users/123')
        .set('Accept', 'application/json')
        .end(function(res) {
          if (res.error) return done(res.error);
          res.body.should.have.property('id', 123);
          res.body.should.have.property('name', 'bob');
          done();
        });
    });

    it('passes error along to callback', function(done) {
      User.find = function(callback) {
        callback(new Error("uh oh"));
      };
      request
        .get(serverUrl + '/users/123')
        .set('Accept', 'application/json')
        .end(function(res) {
          res.error.should.not.equal(false);
          done();
        });
    });
  });

  describe('resource.create()', function(done) {
    it('responds to POST /users', function(done) {
      request
        .post(serverUrl + '/users')
        .send({ id: 123, name: "bob" })
        .set('Accept', 'application/json')
        .end(function(res) {
          if (res.error) return done(res.error);
          res.status.should.equal(200);
          res.body.should.have.property('id', 123);
          done();
        });
    });

    it('passes error along to callback', function(done) {
      request
        .post(serverUrl + '/users')
        .set('Accept', 'application/json')
        .end(function(res) {
          res.error.should.not.equal(false);
          done();
        });
    });
  });

  describe('resource.update()', function(done) {
    it('responds to PUT /users/123', function(done) {
      User.find = function(id, callback) {
        callback(null, new User({ id: 123, name: "jeff" }));
      };
      request
        .put(serverUrl + '/users/123')
        .send({ name: "jeff" })
        .set('Accept', 'application/json')
        .end(function(res) {
          if (res.error) return done(res.error);
          res.body.should.have.property('id', 123);
          res.body.should.have.property('name', 'jeff');
          done();
        });
    });

    it('passes error along to callback', function(done) {
      User.find = function(id, callback) {
        callback(new Error("uh oh"));
      };
      request
        .put(serverUrl + '/users/123')
        .send({ name: "jeff" })
        .set('Accept', 'application/json')
        .end(function(res) {
          res.error.should.not.equal(false);
          done();
        });
    });
  });

  describe('resource.destroy()', function(done) {
    var user = new User({ id: 123, name: "jeff" });

    it('responds to DELETE /users/123', function(done) {
      User.find = function(id, callback) {
        callback(null, user);
      };
      user.remove = function(callback) {
        callback(null);
      };
      request
        .del(serverUrl + '/users/123')
        .set('Accept', 'application/json')
        .end(function(res) {
          if (res.error) return done(res.error);
          res.status.should.equal(204);
          done();
        });
    });

    it('passes error along to callback', function(done) {
      User.find = function(id, callback) {
        callback();
      };
      user.remove = function(callback) {
        callback(new Error("uh oh"));
      };
      request
        .del(serverUrl + '/users/123')
        .set('Accept', 'application/json')
        .end(function(res) {
          res.error.should.not.equal(false);
          done();
        });
    });
  });

  describe('resource.options()', function(done) {
    var user = new User({ id: 123, name: "jeff" });

    it('responds to OPTIONS /users', function(done) {
      request
        .options(serverUrl + '/users')
        .set('Accept', 'application/json')
        .end(function(res) {
          if (res.error) return done(res.error);
          res.body.should.have.property('GET');
          res.body.should.have.property('POST');
          done();
        });
    });

    it('responds to OPTIONS /users/count', function(done) {
      request
        .options(serverUrl + '/users/count')
        .set('Accept', 'application/json')
        .end(function(res) {
          if (res.error) return done(res.error);
          res.body.should.have.property('GET');
          done();
        });
    });

    it('responds to OPTIONS /users/123', function(done) {
      request
        .options(serverUrl + '/users/123')
        .set('Accept', 'application/json')
        .end(function(res) {
          if (res.error) return done(res.error);
          res.body.should.have.property('GET');
          res.body.should.have.property('PUT');
          res.body.should.have.property('DELETE');
          done();
        });
    });

    it('passes error along to callback', function(done) {
      request
        .options(serverUrl + '/noroute')
        .set('Accept', 'application/json')
        .end(function(res) {
          res.error.should.not.equal(false);
          done();
        });
    });
  });
});
