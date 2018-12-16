const express = require('express');
const router = express.Router();
const logic = require('./logic/task_logic');

router.get('/', function(req, res) {
    let token = req.query.token;
    let selection = req.query.select;
    //get list task
    let result = logic.getTaskslist(token, selection);
    //set codice di stato e risultato
    res.status(result.status);
    res.json(result.body);
});

router.post('/', function(req, res) {
    let token = req.query.token;
    let body = req.body;
    //post task
    let result = logic.createTask(token, body);
    res.status(result.status);
    res.json(result.body);
});

router.get('/:task_id', function(req, res) {
    let token = req.query.token;
    let task_id = req.params.task_id;
    //set codice di stato e risultato
    let result = logic. accessSpecificTask(token, task_id);
    res.status(result.status);
    res.json(result.body);
});

router.put('/:task_id', function(req, res) {
    let token = req.query.token;
    let body = req.body;
    let task_id = req.params.task_id;
    //set codice di stato e risultato
    let result = logic.updateTask(token, body, task_id);
    res.status(result.status);
    res.json(result.body);
});

router.delete('/:task_id', function(req, res) {
    let token = req.query.token;
    let task_id = req.params.task_id;
    //set codice di stato e risultato
    let result = logic.deleteTask(token, task_id);
    res.status(result.status);
    res.json(result.body);
});

module.exports = router;
