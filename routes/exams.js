const express = require('express');
const router = express.Router();
const logic = require('./logic/exam_logic');

router.get('/', function (req, res) {

        //get parametri necessari
        let token = req.query.token;
        let selection = req.query.select;
        //get lista di esame
        let result = logic.getExamlist(token, selection);
        //set codice di stato e risultato
        res.status(result.status);
        res.json(result.body);
});
router.post('/', function (req, res) {

        //get parametri necessari
        let token = req.query.token;
        let postBody = req.body;
        let result = logic.postExam(token, postBody);
        //set codice di stato e risultato
        res.status(result.status);
        res.json(result.body);
});
router.get('/:id', function (req, res) {

        //get parametri necessari
        let id = req.params["id"];
        let token = req.query.token;
        //get lista di esame
        let result = logic.getExam(token, id);
        //set codice di stato e risultato
        res.status(result.status);
        res.json(result.body);
});

router.put('/:id', function (req, res) {

        //get parametri necessari
        let id = req.params["id"];
        let token = req.query.token;
        let putBody = req.body;
        let result = logic.putExam(token, putBody, id);
        //set codice di stato 
        res.status(result.status);
        res.json();
});


router.get('/:id/exam_submissions', function (req, res) {

        //get parametri necessari
        let id = req.params["id"];
        let token = req.query.token;
        let result = logic.getSubmissionsOfExam(token, id);
        //set codice di stato 
        res.status(result.status);
        res.json(result.body);
});

module.exports.router = router;