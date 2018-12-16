const express = require('express');
const router = express.Router();
const mdb = require ('./../mdb/mdb.js');
const logic = require('./logic/logout_logic');

router.get('/', function(req, res) {
        logic.logoutFunction(req.query.token);
        res.send('logout resources');
});

module.exports = router;
