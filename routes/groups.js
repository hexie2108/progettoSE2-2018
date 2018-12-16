const express = require('express');
const router = express.Router();
const mdb = require ('./../mdb/mdb.js');
const logic = require('./logic/groups_logic');

/*##### ROUTES CATCH SECTION #####*/

router.get('/',function(req, res) {
    res.setHeader('Content-type', 'application/json');
    var result = logic.getGroups(req.query.token);
    res.status(result.status);
	res.json(result.body);
});

router.post('/',function (req, res) {
    res.setHeader('Content-type', 'application/json');
    var result = logic.createGroup(req.body, req.query.token);
    res.status(result.status);
	res.json(result.body);
});

router.get('/:group_id/', function (req, res) {
    res.setHeader('Content-type', 'application/json');
    var result = logic.getGroup(req.query.token, req.params.group_id);
    res.status(result.status);
	res.json(result.body);
});

router.put('/:group_id/', function (req, res) {
    res.setHeader('Content-type', 'application/json');
    var result = logic.updateGroup(req.params.group_id, req.body, req.query.token);
    res.status(result.status);
	res.json();
    //res.sendStatus(mdb.groups.updateById(req.params.id, req.body.name, req.body.description, req.body.members_id));
});

router.delete('/:group_id/', function (req, res) {
    res.setHeader('Content-type', 'application/json');
    if(mdb.groups.getGroupById(req.params.group_id) !== undefined){
        if(mdb.active_users.getUserByToken(req.query.token) !== null){
            if(mdb.groups.getGroupById(req.params.group_id).owner.email === mdb.active_users.getUserByToken(req.query.token).email){
                res.status(mdb.groups.deleteById(req.params.group_id));
                res.json(undefined);
            }else{
                res.status(403);
                res.json(undefined);
            }
        }else{
            res.status(401);
            res.json(undefined);
        }
    }else{
        res.status(404);
        res.json(undefined);
    }
    
});

module.exports = router;