/**
 * modella-resource tests
 */

var express = require('express')
  , plugin = require('..')
  , modella = require('modella')
  , should = require('should')
  , request = require('supertest');

describe('module', function() {
  it('exports modella plugin', function(done) {
    should.exist(plugin);
    plugin.should.be.a('function');
    var fn = plugin();
    should.exist(fn);
    fn.should.be.a('function');
    done();
  });

  it('exports Resource', function(done) {
    plugin.should.have.property('Resource');
    plugin.Resource.should.be.a('function');
    done();
  });
});

describe('plugin', function() {
  it('creates resource for model', function(done) {
    User = modella('User').attr('id').attr('name');
    User.use(plugin());
    User.should.have.property('resource');
    User.resource.should.have.property('Model');
    done();
  });

  it('adds resource methods to model', function(done) {
    User = modella('User').attr('id').attr('name');
    User.use(plugin());
    User.should.have.property('middleware');
    User.middleware.should.be.a('function');
    User.should.have.property('add');
    User.add.should.be.a('function');
    done();
  });
});

describe('Resource', function() {
  var app = express();
  app.use(express.bodyParser());

  User = modella('User').attr('id').attr('name');
  User.base = '/users';

  var resource = new plugin.Resource(User);

  it('exports middleware', function(done) {
    var middleware = resource.middleware();
    should.exist(middleware);
    middleware.should.be.a('function');
    app.use(middleware);
    app.use(function(err, req, res, next) {
      res.json(500, { error: err.message });
    });
    done();
  });

  describe('.index()', function() {
    it('responds to GET /users', function(done) {
      resource.Model.all = function(query, callback) {
        callback(null, []);
      };
      request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });

    it('passes error along to response', function(done) {
      resource.Model.all = function(query, callback) {
        callback(new Error("uh oh"));
      };
      request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .expect(500)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('error');
          done();
        });
    });
  });

  describe('.count()', function(done) {
    it('responds to GET /users/count', function(done) {
      resource.Model.count = function(query, callback) {
        callback();
      };
      request(app)
        .get('/users/count')
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });

    it('passes error along to response', function(done) {
      resource.Model.count = function(query, callback) {
        callback(new Error("uh oh"));
      };
      request(app)
        .get('/users/count')
        .set('Accept', 'application/json')
        .expect(500)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('error');
          done();
        });
    });
  });

  describe('.show()', function(done) {
    it('responds to GET /users/123', function(done) {
      resource.Model.find = function(id, callback) {
        callback(null, { id: 123, name: "bob" });
      };
      request(app)
        .get('/users/123')
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('id', 123);
          res.body.should.have.property('name', 'bob');
          done();
        });
    });

    it('passes error along to response', function(done) {
      resource.Model.find = function(callback) {
        callback(new Error("uh oh"));
      };
      request(app)
        .get('/users/123')
        .set('Accept', 'application/json')
        .expect(500)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('error');
          done();
        });
    });
  });

  describe('.create()', function(done) {
    it('responds to POST /users', function(done) {
      request(app)
        .post('/users')
        .send({ id: 123, name: "bob" })
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err) return done(err);
          res.status.should.equal(200);
          res.body.should.have.property('id', 123);
          done();
        });
    });

    it('passes error along to response', function(done) {
      request(app)
        .post('/users')
        .set('Accept', 'application/json')
        .expect(500)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('error');
          done();
        });
    });
  });

  describe('.update()', function(done) {
    it('responds to PUT /users/123', function(done) {
      resource.Model.find = function(id, callback) {
        callback(null, new User({ id: 123, name: "jeff" }));
      };
      request(app)
        .put('/users/123')
        .send({ name: "jeff" })
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('id', 123);
          res.body.should.have.property('name', 'jeff');
          done();
        });
    });

    it('passes error along to response', function(done) {
      resource.Model.find = function(id, callback) {
        callback(new Error("uh oh"));
      };
      request(app)
        .put('/users/123')
        .send({ name: "jeff" })
        .set('Accept', 'application/json')
        .expect(500)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('error');
          done();
        });
    });
  });

  describe('.destroy()', function(done) {
    var user = new User({ id: 123, name: "jeff" });

    it('responds to DELETE /users/123', function(done) {
      resource.Model.find = function(id, callback) {
        callback(null, user);
      };
      user.remove = function(callback) {
        callback(null);
      };
      request(app)
        .del('/users/123')
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err) return done(err);
          res.status.should.equal(204);
          done();
        });
    });

    it('passes error along to response', function(done) {
      resource.Model.find = function(id, callback) {
        callback();
      };
      user.remove = function(callback) {
        callback(new Error("uh oh"));
      };
      request(app)
        .del('/users/123')
        .set('Accept', 'application/json')
        .expect(500)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('error');
          done();
        });
    });
  });

  describe('.options()', function(done) {
    var user = new User({ id: 123, name: "jeff" });

    it('responds to OPTIONS /users', function(done) {
      request(app)
        .options('/users')
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('GET');
          res.body.should.have.property('POST');
          done();
        });
    });

    it('responds to OPTIONS /users/count', function(done) {
      request(app)
        .options('/users/count')
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('GET');
          done();
        });
    });

    it('responds to OPTIONS /users/123', function(done) {
      request(app)
        .options('/users/123')
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('GET');
          res.body.should.have.property('PUT');
          res.body.should.have.property('DELETE');
          done();
        });
    });
  });
});
