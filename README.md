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

app.use(resource(User).middleware());
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

## Self-describing OPTIONS

If an `OPTIONS` request is made to any endpoint defined by modella-resource, a
JSON description of the available actions is included in the response body.

You can combine this with OPTIONS middleware mounted at your API root path,
which responds with a JSON description of the available resources.

## Actions

You can override the resource actions if you want to customize the route
callbacks. Each actions is called with arguments `Model, req, res, next`:

```javascript
app.use(resource(User, {
  index:   function(Model, req, res, next) { },
  count:   function(Model, req, res, next) { },
  show:    function(Model, req, res, next) { },
  create:  function(Model, req, res, next) { },
  update:  function(Model, req, res, next) { },
  destroy: function(Model, req, res, next) { }
});
```

## Nesting resources

You can nest resources using `resource.add()`:

```javascript
var UserResource = resource(User);
var PostResource = resource(Post);

app.use(UserResource.add(PostResource).middleware());
```

This creates routes such as `/users/:id/posts` and so on.

## Resource#middleware

Returns Express/Connect middleware.

## MIT Licensed
