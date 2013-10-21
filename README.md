# modella-resource

[![Build Status](https://secure.travis-ci.org/alexmingoia/modella-resource.png)](http://travis-ci.org/alexmingoia/modella-resource) 
[![Dependency Status](https://david-dm.org/alexmingoia/modella-resource.png)](http://david-dm.org/alexmingoia/modella-resource)

Expose Modella models via Express middleware. Adds REST routes with callbacks
including self-describing OPTIONS response for each route.

This module can be paired with [modella-ajax](https://github.com/modella/ajax)
for automatic client-server communication.

## Installation

```sh
npm install modella-resource
```

## Example

Pass a Modella model constructor to the modella-resource middleware and mount it:

```javascript
var app = express();
  , modella = require('modella');
  , resource = require('modella-resource');

var User = modella('User');

User.use(resource());

app.use(User.middleware());
```

These routes will then be available:

```
/users
    GET, POST, OPTIONS
/users/count
    GET, OPTIONS
/users/:id
    GET, PUT, DELETE, OPTIONS
```

## Nesting resources

You can nest resources using `resource.add()`:

```javascript
User.use(resource());
Post.use(resource());

app.use(User.add(Post).middleware());
```

This creates routes such as `/users/:id/posts` and so on.

## Resource#middleware

Returns Express/Connect middleware.

## Options

### Before hook

You can run middleware after the request is matched, but before the resource
action is run using `options.before`.

```javascript
// Run middleware before any action
User.use(resource({
  before: function(req, res, next) {
    console.log(this);
    // => resource
    console.log(this.Model);
    // => Model
  }
}));

// Run middleware before specific actions
User.use(resource({
  before: {
    show: myMiddleware,
    create: myMiddleware
  }
}));
```

### Context integration

You can automatically set the
[context](https://github.com/alexmingoia/modella-context) of model(s) loaded
from `req.ctx` by enabling `options.setContext`. Any model loaded, including
those returned in collections, will have their context set.

```javascript
User.use(resource({
  setContext: true
}));
```

### Override actions

You can override the resource actions if you want to customize the route
callbacks. Each actions is called with arguments `Model, req, res, next`:

```javascript
User.use(resource({
  actions: {
    index:   function(req, res, next) { },
    count:   function(req, res, next) { },
    show:    function(req, res, next) { },
    create:  function(req, res, next) { },
    update:  function(req, res, next) { },
    destroy: function(req, res, next) { }
  }
}));

// You may also override them after the resource is created:
User.resource.index = myIndexAction;
```

## Self-describing OPTIONS

If an `OPTIONS` request is made to any endpoint defined by modella-resource, a
JSON description of the available actions is included in the response body.

You can combine this with OPTIONS middleware mounted at your API root path,
which responds with a JSON description of the available resources.

## MIT Licensed
