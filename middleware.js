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
    if (pathToActions[path]) {
      req.modelPath = path;
      if (req.method === 'OPTIONS') {
        actions.options(Model, req, res, next);
      }
      else if (pathToActions[path][req.method]) {
        actions[pathToActions[path][req.method]](Model, req, res, next);
      }
    }
    else {
      next();
    }
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

actions.options = function(Model, req, res, next) {
  var body = {};
  if (req.path === Model.base) {
    body.GET = generateActionSpec('index', Model);
    body.POST = generateActionSpec('create', Model);
    res.setHeader('Allow', 'GET, POST');
  }
  else if (req.modelPath === Model.base + '/:id') {
    body.GET = generateActionSpec('show', Model);
    body.PUT = generateActionSpec('update', Model);
    body.DELETE = generateActionSpec('destroy', Model);
    res.setHeader('Allow', 'GET, PUT, DELETE');
  }
  else if (req.modelPath === Model.base + '/count') {
    body.GET = generateActionSpec('count', Model);
    res.setHeader('Allow', 'GET');
  }
  res.json(body);
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
