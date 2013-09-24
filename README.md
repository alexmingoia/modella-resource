# modella-express

Expose Modella models via Express middleware. Adds REST routes with callbacks
including self-describing OPTIONS response for each route.

This module can be paired with [modella-ajax](https://github.com/modella/ajax)
for automatic client-server communication.

## Installation

```sh
npm install modella-express
```

## Example

Pass a Modella model constructor to the modella-express middleware and mount it:

```javascript
var app = express();
var modella = require('modella');
var modellaMiddleware = require('modella-express');

var User = modella('User');

app.use(modellaMiddleware(User));
```

## Actions

Each action callback is exposed via `exports.actions`.

You can override these if you want to customize your action callbacks. Each
actions is called with arguments `Model, req, res, next`:

```javascript
var actions = require('modella-express').actions;

actions.index = function(Model, req, res, next) {
  // ...
};

actions.count = function(Model, req, res, next) {
  // ...
};

actions.show = function(Model, req, res, next) {
  // ...
};

actions.create = function(Model, req, res, next) {
  // ...
};

actions.update = function(Model, req, res, next) {
  // ...
};

actions.destroy = function(Model, req, res, next) {
  // ...
};
```

## MIT Licensed
