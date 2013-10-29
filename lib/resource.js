/**
 * modella-resource
 *
 * Expose Modella models via RESTful resource middleware.
 *
 * @link https://github.com/alexmingoia/modella-resource
 * @author Alex Mingoia <talk@alexmingoia.com>
 */

module.exports = function(Model) {
  Model.middleware = {};

  // Bind `Model` to resource actions middleware
  for (var action in exports) {
    Model.middleware[action] = exports[action].bind(Model);
  }

  return Model;
};

exports.index = function(req, res, next) {
  this.all(req.query, function(err, collection) {
    if (err) return next(err);
    res.json(collection);
  });
};

exports.count = function(req, res, next) {
  this.count(req.query, function(err, count) {
    if (err) return next(err);
    res.json({ count: count });
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
    res.set('Location', model.url());
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
