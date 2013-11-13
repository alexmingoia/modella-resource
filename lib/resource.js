/**
 * modella-resource
 *
 * Expose Modella models via RESTful resource middleware.
 *
 * @link https://github.com/alexmingoia/modella-resource
 * @author Alex Mingoia <talk@alexmingoia.com>
 */

var extend = require('extend');

module.exports = function(settings) {
  return function(Model) {
    Model.middleware = {};

    // Bind `Model` to resource actions middleware
    for (var action in exports) {
      if (exports.hasOwnProperty(action)) {
        Model.middleware[action] = exports[action].bind(Model);
      }
    }

    return Model;
  };
};

exports.index = function(req, res, next) {
  if (req.params) extend(req.query, req.params);
  this.all(req.query, function(err, results) {
    if (err) return next(err);
    res.json(results);
  });
};

exports.show = function(req, res, next) {
  this.find(req.params.id, function(err, model) {
    if (err) return next(err);
    res.json(model);
  });
};

exports.create = function(req, res, next) {
  var model = new this(req.body);
  model.save(function(err) {
    if (err) {
      err.model = model;
      return next(err);
    }
    res.json(model);
  });
};

exports.update = function(req, res, next) {
  this.find(req.params.id, function(err, model) {
    if (err) return next(err);
    model.set(req.body);
    model.save(function(err) {
      if (err) {
        err.model = model;
        return next(err);
      }
      res.json(model);
    });
  });
};

exports.destroy = function(req, res, next) {
  this.find(req.params.id, function(err, model) {
    if (err) return next(err);
    model.remove(function(err) {
      if (err) {
        err.model = model;
        return next(err);
      }
      res.send(204);
    });
  });
};
