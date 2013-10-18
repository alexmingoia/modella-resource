/**
 * modella-resource
 *
 * Expose Modella models via Express middleware.
 *
 * Adds REST routes with callbacks including self-describing OPTIONS response
 * for each route. Also supports nested resource routes e.g. /forums/3/threads
 *
 * @link https://github.com/alexmingoia/modella-resource
 * @author Alex Mingoia <talk@alexmingoia.com>
 */

/**
 * Dependencies
 */

var extend = require('extend')
  , inflect = require('inflect');

/**
 * Expose `Resource`
 */

module.exports = Resource;

/**
 * Create new Resource with given `Model`.
 *
 * @param {modella.Model} Model
 * @param {Object} actions Override resource actions for this Model.
 * @return {Resource}
 * @api public
 */

function Resource(Model, actions) {
  if (!(this instanceof Resource)) return new Resource(Model, actions);
  this.Model = Model;
  this.base = Model.base;
  this.nested = [];
  this.path;
  if (actions) {
    for (var key in actions) {
      if (Resource.prototype[key]) {
        this[key] = actions[key];
      }
    }
  }
  this.urls = [{
    regex:  new RegExp('^' + this.base + '$'),
    GET:    'index',
    POST:   'create'
  }, {
    regex:  new RegExp('^' + this.base + '/count$'),
    GET:    'count'
  }, {
    regex:  new RegExp('^' + this.base + '/([^/]+)'),
    GET:    'show',
    PUT:    'update',
    DELETE: 'destroy'
  }];
};

/**
 * Resource prototype
 */

var resource = Resource.prototype;

/**
 * Returns Express/Connect middleware.
 *
 * @return {Function(req, res, next)}
 * @api public
 */

resource.middleware = function() {
  var self = this;
  return function(req, res, next) {
    req.params = req.params || {};
    self.match(req.path, req, res, next);
  };
};

/**
 * Match given `path` and `req` with resource action.
 *
 * @param {String} path
 * @param {http.ServerRequest} req
 * @param {http.ServerResponse} res
 * @param {Function(err)} next
 * @api private
 */

resource.match = function(path, req, res, next) {
  var Model = this.Model;
  var urls = this.urls;
  var nested = this.nested;
  for (var len = urls.length, i=0; i<len; i++) {
    var matches = path.match(urls[i].regex);
    if (!matches) continue;
    if (urls[i][req.method]) {
      if (matches[1]) req.params.id = matches[1];
      if (matches[0] === path) {
        return this[urls[i][req.method]](req, res, next);
      }
      if (nested.length) {
        var i = 0;
        var nextResource = function(err) {
          if (err) return next(err);
          i++;
          if (nested[i]) {
            return nested[i](path, req, res, nextResource);
          }
          next();
        };
        return this.load(matches[1], function(err, model) {
          if (err) return next(err);
          req[Model.modelName.toLowerCase()] = model;
          req.query.related = model;
          nested[0].path = path.replace(matches[0], '');
          nested[0].match(nested[0].path, req, res, nextResource);
        });
      }
    }
    else if ('OPTIONS' === req.method) {
      return this.options(urls[i], req, res, next);
    }
  }
  next();
};

resource.load = function(id, callback) {
  this.Model.find(id, callback);
};

resource.add = function(resource) {
  this.nested.push(resource);
  return this;
};

resource.index = function(req, res, next) {
  this.Model.all(req.query, function(err, collection) {
    if (err) return next(err);
    res.json(collection);
  });
};

resource.count = function(req, res, next) {
  this.Model.count(req.query, function(err, count) {
    if (err) return next(err);
    res.json({ count: count });
  });
};

resource.show = function(req, res, next) {
  this.Model.find(req.params.id, function(err, model) {
    if (err) return next(err);
    res.json(model);
  });
};

resource.create = function(req, res, next) {
  var model = new this.Model(req.body);
  model.save(function(err) {
    if (err) {
      err.model = model;
      return next(err);
    }
    res.set('Location', model.url());
    res.json(model);
  });
};

resource.update = function(req, res, next) {
  this.Model.find(req.params.id, function(err, model) {
    if (err) {
      err.model = model;
      return next(err);
    }
    model.set(req.body);
    model.save(function(err) {
      if (err) return next(err);
      res.json(model);
    });
  });
};

resource.destroy = function(req, res, next) {
  this.Model.find(req.params.id, function(err, model) {
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

resource.options = function(actions, req, res, next) {
  var body = {};
  var methods = [];
  var Model = this.Model;
  for (var method in actions) {
    if (actions.hasOwnProperty(method) && method != 'regex') {
      body[method] = generateActionSpec(actions[method], Model);
      methods.push(method);
    }
  }
  res.setHeader('Allow', methods.join(', '));
  res.json(200, body);
};

/**
 * Generate action JSON spec from `action` and `Model`.
 *
 * @param {String} action
 * @param {modella.Model} Model
 * @return {Object}
 * @api private
 */

function generateActionSpec(action, Model) {
  var spec = {};
  switch (action) {
    case 'index':
    case 'count':
      spec.description = (action == 'index' ? "Find " : "Count ")
                         + inflect.pluralize(Model.modelName) + ".";
      spec.parameters = generateActionParams(Model);
      delete spec.parameters[Model.primaryKey];
      break;
    case 'create':
      spec.description = "Create new " + Model.modelName + ".";
      spec.parameters = generateActionParams(Model);
      delete spec.parameters[Model.primaryKey];
      spec.example = generateModelExample(Model);
      if (spec.example[Model.primaryKey]) {
        delete spec.example[Model.primaryKey];
      }
      break;
    case 'show':
      spec.description = "Find " + Model.modelName + " by id.";
      break;
    case 'update':
      spec.description = "Update " + Model.modelName + ".";
      spec.parameters = generateActionParams(Model);
      spec.example = generateModelExample(Model);
      break;
    case 'destroy':
      spec.description = "Delete " + Model.modelName + " by id.";
      break;
  }
  return spec;
};

/**
 * Generate example JSON from `model`.
 *
 * @param {modella.Model} model
 * @return {Object}
 * @api private
 */

function generateModelExample(Model) {
  var example = {};
  for (var attr in Model.attrs) {
    if (Model.attrs[attr].example) {
      example[attr] = Model.attrs[attr].example;
    }
  }
  if (!example[Model.primaryKey]) {
    example[Model.primaryKey] = 1;
  }
  return example;
};

/**
 * Generate parameters for action OPTIONS JSON.
 *
 * @param {modella.Model} Model
 * @return {Object}
 * @api private
 */

function generateActionParams(Model) {
  var params = {};
  for (var attr in Model.attrs) {
    var attribute = Model.attrs[attr];
    params[attr] = {
      type: modellaTypeToString(attribute.type)
    };
    if (Model.attrs[attr].description) {
      params[attr].description = Model.attrs[attr].description;
    }
  }
  return params;
};

/**
 * Convert modella model type to string.
 *
 * @param {Function} type
 * @return {String}
 * @api private
 */

function modellaTypeToString(type) {
  if (!type || !type.name) return 'string';
  switch (type.name) {
    case 'Array':
      return 'array';
    case 'String':
      return 'string';
    case 'Date':
    case 'Number':
      return 'integer';
    case 'Boolean':
      return 'boolean';
    default:
      return 'string';
  }
};
