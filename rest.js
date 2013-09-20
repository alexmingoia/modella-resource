/**
 * modella-rest
 *
 * Create RESTful resource routes for a given Modella model.
 *
 * @link https://github.com/bloodhound/modella-rest
 * @author Bloodhound <alex@bloodhound.com>
 */

/**
 * Dependencies
 */

var inflect = require('inflect');

/**
 * Add REST resource paths and actions for a given `Model`.
 *
 * @param {Model} Model
 * @return {Model}
 * @api public
 */

module.exports = function(Model) {
  Model.base = '/' + inflect.pluralize(Model.modelName).toLowerCase();
  Model.resource = Model.resource || {};
  Model.resource.index = {
    path: Model.base,
    action: function(req, res, next) {
      exports.index(Model, req, res, next);
    }
  };
  Model.resource.create = {
    path: Model.base,
    action: function(req, res, next) {
      exports.create(Model, req, res, next);
    }
  };
  Model.resource.show = {
    path: Model.base + '/:id',
    action: function(req, res, next) {
      exports.show(Model, req, res, next);
    }
  };
  Model.resource.update = {
    path: Model.base + '/:id',
    action: function(req, res, next) {
      exports.update(Model, req, res, next);
    }
  };
  Model.resource.destroy = {
    path: Model.base + '/:id',
    action: function(req, res, next) {
      exports.destroy(Model, req, res, next);
    }
  };
  Model.map = exports.map.bind(Model);
  return Model;
};

exports.map = function(router) {
  var resource = this.resource;
  router.get(resource.index.path, resource.index.action);
  router.get(resource.show.path, resource.show.action);
  router.post(resource.create.path, resource.create.action);
  router.put(resource.update.path, resource.update.action);
  router.del(resource.destroy.path, resource.destroy.action);
};

exports.index = function(Model, req, res, next) {
  Model.all(req.query, function(err, collection) {
    if (err) return next(err);
    res.json(collection);
  });
};

exports.show = function(Model, req, res, next) {
  Model.find(req.params.id, function(err, model) {
    if (err) return next(err);
    res.json(model);
  });
};

exports.create = function(Model, req, res, next) {
  var model = new Model(req.body);
  model.save(function(err) {
    if (err) return next(err);
    res.set('Location', model.url());
    res.send(201);
  });
};

exports.update = function(Model, req, res, next) {
  Model.find(req.params.id, function(err, model) {
    if (err) return next(err);
    model.set(req.body);
    model.save(function(err) {
      if (err) return next(err);
      res.json(model.toJSON());
    });
  });
};

exports.destroy = function(Model, req, res, next) {
  Model.find(req.params.id, function(err, model) {
    if (err) return next(err);
    model.remove(function(err) {
      if (err) return next(err);
      res.send(204);
    });
  });
};
