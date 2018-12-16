const express = require('express');
const router = express.Router();
const logic = require('./logic/exam_submission_logic');

router.get('/', function(req, res) {
	var result = logic.display_exam_submission_list(req.query.token, req.query.select);
	res.status(result.status);
	res.json(result.body);
});

router.post('/', function(req, res){
	var result = logic.insert_exam_submission(req.query.token, req.body);
	res.status(result.status);
	res.json(result.body);
});

router.get('/:id/', function(req, res){
	var result = logic.display_exam_submission(req.query.token, req.params.id);
	res.status(result.status);
	res.json(result.body);
});

router.put('/:id/', function(req, res){
	result = logic.update_exam_submission(req.query.token, req.params.id, req.body);
	res.status(result.status);
	res.json();
});

router.patch('/:id/', function(req, res){
	result = logic.assign_submission_evaluation(req.query.token, req.params.id, req.body);
	res.status(result.status);
	res.json();
});

router.get('/:id/exam_peer_reviews', function(req, res){
	var result = logic.exam_submission_peer_review_list(req.query.token, req.params.id);
	res.status(result.status);
	res.json(result.body);
});

module.exports = router;
