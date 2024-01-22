// Create web server
// Run: node comments.js

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({extended: false});

var redis = require('redis');
var client = redis.createClient();

client.select((process.env.NODE_ENV || 'development').length);

app.use(express.static('public'));

app.get('/comments', function(request, response) {
  client.hkeys('comments', function(error, names) {
    if (error) throw error;
    response.json(names);
  });
});

app.post('/comments', parseUrlencoded, function(request, response) {
  var newComment = request.body;
  if (!newComment.name || !newComment.comment) {
    response.sendStatus(400);
    return false;
  }

  client.hset('comments', newComment.name, newComment.comment, function(error) {
    if (error) throw error;
    response.status(201).json(newComment.name);
  });
});

app.delete('/comments/:name', function(request, response) {
  client.hdel('comments', request.params.name, function(error) {
    if (error) throw error;
    response.sendStatus(204);
  });
});

app.listen(3000);
