# modella-resource

[![Build Status](https://secure.travis-ci.org/alexmingoia/modella-resource.png)](http://travis-ci.org/alexmingoia/modella-resource) 
[![Dependency Status](https://david-dm.org/alexmingoia/modella-resource.png)](http://david-dm.org/alexmingoia/modella-resource)

Expose [Modella](https://github.com/modella/modella/) models via RESTful resource middleware.

This module can be paired with [modella-ajax](https://github.com/modella/ajax)
for automatic client-server communication.

## Installation

```sh
npm install modella-resource
```

## Example

```javascript
var express = require('express')
  , modella = require('modella');

var User = modella('User');

User
  .use(require('modella-resource'))
  .attr('id')
  .attr('name');

var app = express();

app
  .use(express.bodyParser())
  .get('/users', User.middleware.index)
  .post('/users', User.middleware.create)
  .get('/users/:id', User.middleware.show)
  .put('/users/:id', User.middleware.update)
  .del('/users/:id', User.middleware.destroy);
```

## MIT Licensed
