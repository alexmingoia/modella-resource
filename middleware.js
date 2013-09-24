/**
 * modella-express
 *
 * Expose Modella models via Express middleware.
 *
 * Adds REST routes with callbacks including self-describing OPTIONS response
 * for each route.
 *
 * @link https://github.com/alexmingoia/modella-express
 * @author Alex Mingoia <talk@alexmingoia.com>
 */

/**
 * Dependencies
 */

var inflect = require('inflect');

/**
 * Create middleware for given modella `Model`.
 *
 * @param {Model} Model
 * @return {Function(req, res, next)} Returns middleware for use with Express.
 * @api public
 */

module.exports = function(Model) {
  Model.base = '/' + inflect.pluralize(Model.modelName).toLowerCase();
  var regex = new RegExp('^' + Model.base + '/([^/]+)');
  var pathToActions = {};
  pathToActions[Model.base] = {
    GET:  'index',
    POST: 'create'
  };
  pathToActions[Model.base + '/count'] = {
    GET: 'count'
  };
  pathToActions[Model.base + '/:id'] = {
    GET:    'show',
    PUT:    'update',
    DELETE: 'destroy'
  };
  return function middleware(req, res, next) {
    var path = req.path.replace(regex, function(str, match) {
      if (match !== 'count') {
        req.params = req.params || {};
        req.params.id = match;
        return str.replace(match, ':id');
      }
      return str;
    });
    if (!pathToActions[path] || !pathToActions[path][req.method]) return next();
    actions[pathToActions[path][req.method]](Model, req, res, next);
  };
};

/**
 * REST resource actions
 */

var actions = exports.actions = {};

actions.index = function(Model, req, res, next) {
  Model.all(req.query, function(err, collection) {
    if (err) return next(err);
    res.json(collection);
  });
};

actions.count = function(Model, req, res, next) {
  Model.count(req.query, function(err, count) {
    if (err) return next(err);
    res.json({ count: count });
  });
};

actions.show = function(Model, req, res, next) {
  Model.find(req.params.id, function(err, model) {
    if (err) return next(err);
    res.json(model);
  });
};

actions.create = function(Model, req, res, next) {
  var model = new Model(req.body);
  model.save(function(err) {
    if (err) return next(err);
    res.set('Location', model.url());
    res.send(201);
  });
};

actions.update = function(Model, req, res, next) {
  Model.find(req.params.id, function(err, model) {
    if (err) return next(err);
    model.set(req.body);
    model.save(function(err) {
      if (err) return next(err);
      res.json(model.toJSON());
    });
  });
};

actions.destroy = function(Model, req, res, next) {
  Model.find(req.params.id, function(err, model) {
    if (err) return next(err);
    model.remove(function(err) {
      if (err) return next(err);
      res.send(204);
    });
  });
};
