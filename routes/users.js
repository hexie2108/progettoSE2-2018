
const express = require('express');
const router = express.Router();
const logic = require('./logic/users_logic.js');

//Verbs calls

router.get('/', function(req, res) {
	let token = req.query.token; //Token already string

	res.setHeader('Content-Type', 'application/json');
	//Test call
	//let data = routerGetUsers(mdb.active_users.getTokenByUserId(0));
	let data = logic.routerGetUsers(token);
	res.send(JSON.stringify(data.body, null, 3));
});

router.post('/', function(req, res) {
	
	let postBody = req.body;

	let data = logic.routerPostUsers(postBody);
	if (data.status === 201) {
		res.status(201);
		res.send(data.body);
	} else {
		res.status(500);
		res.send({code: 500, message: 'user probably already registered or wrong email format, try using another email'});
	}
	//Other stati determined automatically I guess
});

router.put('/', function(req, res) {
	let putBody = req.body;
	let token = req.query.token;
	let data = logic.routerUpdateUser(token, putBody);
	res.status(data.status);
	res.json();
});

router.get('/:user_id', function(req, res) {
	let token = req.query.token;

	//PARSE INT ON STRING PARAMETER
	let id = parseInt(req.params.user_id, 10);
	
	res.setHeader('Content-Type', 'application/json');
	//Test call
	//let data = routerGetUserById(mdb.active_users.getTokenByUserId(0), id);
	let data = logic.routerGetUserById(token, id);
	res.status(data.status);
	res.send(JSON.stringify(data.body, null, 3));
})

router.get('/:user_id/exams', function(req, res) {
	let token = req.query.token;
	let id = parseInt(req.params.user_id, 10);
	let selection = req.query.select;

	res.setHeader('Content-Type', 'application/json');
	//test call
	//let data = routerGetUsersExams(mdb.active_users.getTokenByUserId(0), id, selection);
	let data = logic.routerGetUsersExams(token, id, selection);
	res.status(data.status);
	res.send(JSON.stringify(data.body, null, 3));
})

router.get('/:user_id/exam_submissions', function(req, res) {
	let token = req.query.token;
	let id = parseInt(req.params.user_id, 10);

	res.setHeader('Content-Type', 'application/json');
	//test call
	//let data = routerGetUsersExamSubmissions(mdb.active_users.getTokenByUserId(2), id);
	let data = logic.routerGetUsersExamSubmissions(token, id)
	res.status(data.status);
	res.send(JSON.stringify(data, null, 3));
})


module.exports = router;