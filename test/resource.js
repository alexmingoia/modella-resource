/**
 * modella-resource tests
 */

var express = require('express')
  , plugin = require('../lib/resource')
  , modella = require('modella')
  , should = require('should')
  , request = require('supertest');

describe('module', function() {
  it('exports modella plugin', function(done) {
    should.exist(plugin);
    plugin.should.be.a('function');
    done();
  });
});

describe('plugin', function() {
  var User = modella('User').use(plugin()).attr('id').attr('name');

  var app = express();

  app
    .use(express.bodyParser())
    .get('/users', User.middleware.index)
    .get('/users/:id', User.middleware.show)
    .post('/users', User.middleware.create)
    .put('/users/:id', User.middleware.update)
    .del('/users/:id', User.middleware.destroy)
    .use(function(err, req, res, next) {
      if (err) {
        return res.json(500, { error: err.message });
      }
      next();
    });

  it('creates actions middleware for model', function(done) {
    User.should.have.property('middleware');
    User.middleware.should.have.property('index');
    User.middleware.should.have.property('show');
    User.middleware.should.have.property('create');
    User.middleware.should.have.property('update');
    User.middleware.should.have.property('destroy');
    done();
  });

  describe('.index()', function() {
    it('responds to GET /users', function(done) {
      User.all = function(query, callback) {
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
      User.all = function(query, callback) {
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

  describe('.show()', function(done) {
    it('responds to GET /users/123', function(done) {
      User.find = function(id, callback) {
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
      User.find = function(callback) {
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
      User.find = function(id, callback) {
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
      User.find = function(id, callback) {
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
      User.find = function(id, callback) {
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
      User.find = function(id, callback) {
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
});
