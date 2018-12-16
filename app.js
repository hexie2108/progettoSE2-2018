const express = require('express');
var bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

var index = require('./routes/index');
var users = require('./routes/users');
var tasks = require('./routes/tasks');
var auth = require ('./routes/auth');
var exams = require ('./routes/exams').router;
var exam_submission = require ('./routes/exam_submission');
var groups = require ('./routes/groups');
var exam_peer_reviews = require ('./routes/exam_peer_reviews').router;
var logout = require ('./routes/logout');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', index);
app.use('/users', users);
app.use('/tasks', tasks);
app.use('/auth', auth);
app.use('/exams', exams);
app.use('/exam_submissions', exam_submission);
app.use('/groups', groups);
app.use('/exam_peer_reviews', exam_peer_reviews);
app.use('/logout', logout);

app.listen(PORT, function(){
	console.log('Server running on port ' + PORT);
});
