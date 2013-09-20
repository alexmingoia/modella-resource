# modella-rest

Create RESTful resource routes for a given Modella model.

## Installation

```sh
npm install modella-rest
```

## Example

Simply add the modella-rest plugin to your model and you will have routes ready
to use with Express:

```javascript
var modella = require('modella');
var rest = require('modella-rest');

var User = modella('User');

User.use(rest);

console.log(User.resource);
```

User.resource looks like:

```javascript
{ index:   { path: '/users',     action: [Function] },
  create:  { path: '/users',     action: [Function] },
  show:    { path: '/users/:id', action: [Function] },
  update:  { path: '/users/:id', action: [Function] },
  destroy: { path: '/users/:id', action: [Function] } },
```

Register routes with Express in one go:

```javascript
var app = express();
var User = modella('user');

User.use(rest);
User.map(app.router);
```

Or manually:

```javascript
var app = express();
var User = modella('user');

User.use(rest);

var resource = User.resource;
app.get(resource.index.path, resource.index.action);
app.get(resource.show.path, resource.show.action);
app.put(resource.update.path, resource.update.action);
app.post(resource.create.path, resource.create.action);
app.del(resource.destroy.path, resource.destroy.action);
```

## MIT Licensed
