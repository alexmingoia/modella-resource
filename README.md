# modella-resource

[![Build Status](https://secure.travis-ci.org/modella/resource.png)](http://travis-ci.org/modella/resource) 
[![Dependency Status](https://david-dm.org/modella/resource.png)](http://david-dm.org/modella/resource)

Expose [Modella][0] models via RESTful resource middleware.

This module can be paired with [modella-ajax][1]
for automatic client-server communication.

## Installation

```sh
npm install modella-resource
```

## Example

Use with [express][2]:

```javascript
var express = require('express')
  , modella = require('modella')
  , resource = require('modella-resource');

var User = modella('User');

User
  .attr('id')
  .attr('name')
  .use('server', resource());

var app = express();

app
  .use(express.bodyParser())
  .get('/users', User.middleware.index)
  .post('/users', User.middleware.create)
  .get('/users/:id', User.middleware.show)
  .put('/users/:id', User.middleware.update)
  .del('/users/:id', User.middleware.destroy);
```

Use with [express-resource][3]:

```javascript
app.resource('users', User.middleware);
```

## MIT Licensed

[0]: https://github.com/modella/modella/
[1]: https://github.com/modella/ajax/
[2]: https://github.com/visionmedia/express/
[3]: https://github.com/visionmedia/express-resource/
