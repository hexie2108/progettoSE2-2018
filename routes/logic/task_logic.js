const mdb = require ('./../../mdb/mdb');
const  generic_e = require('./../../schemas/errors/generic.json');
const Ajv = require('ajv');
var ajv = new Ajv();

/*function checkSelection(selection) {
    if (selection == "all") { return 1; }
    if (selection == "created") { return 2; }
    else { return 0; }
}*/

/*function getTaskslist(token, selection) {
    //il risultato da ritornare
    let result;
    //get user
    let user = mdb.active_users.getUserByToken(token);
    //if isn't empty
    if (user === null) {
        result = generic_e.error401;
    }
    //if isn't valid selection value
    else if (checkSelection(selection) === 0) {
        result = generic_e.error400;
    } else {
        let body = [];
        if (checkSelection(selection) === 1)
        {
            body=mdb.tasks
        }
        else if (checkSelection(selection) === 2)
        {
            body = mdb.tasks.filterByOwner(user);
        }

        //se body è un array vuoto, significa 404
        if (body.length === 0)
        {
            result = generic_e.error404;
        }
        else
        {
            result = {};
            result.status = 200;
            result.body = body;
        }

    }

    return result;
}*/

function getTaskslist(token, selection) {
    let user = mdb.active_users.getUserByToken(token);
    
    if (user !==null && user!==undefined){
        switch (selection) {
            case 'all': {
                return {status: 200, body: {code: 200, body: mdb.tasks}};
            }
            case 'created': {
                return {status: 200, body: {code: 200, body: mdb.tasks.filterByOwner(user)}};
            }
            default:{
                return generic_e.error400;
            }
        }
    }
    return generic_e.error401;
}

function checkAtt(body){
    if (body.task_type == undefined || body.subject == undefined || body.title == undefined || body.description == undefined || body.solutions == undefined || body.task_type == "" || body.subject == "" || body.title == "" || body.description == "" || body.solutions == "")
    { return false; } else { return true; }
}

function createTask(token, body) {
    //get user
    let user = mdb.active_users.getUserByToken(token);
    //if isn't empty
    if (user !== null&&user !==undefined){
        //console.log(body);
        if (ajv.validate(require('./../../schemas/payloads/tasks_post.json'), body)){
            let result = mdb.tasks.add({id:user.id, email: user.email}, body.task_type,
                body.title, body.subject, body.description, body.options, body.solutions);
            return {"status" : 200, "body" : result};
        } else {
            return generic_e.error400;
        }
    } else {
        return generic_e.error401;
    }
} 



function accessSpecificTask(token, task_id) {

    //il risultato da ritornare
    let result;
    //get user
    let user = mdb.active_users.getUserByToken(token);
    //if isn't empty
    if (user === null)
    {
        result = generic_e.error401;
    }
    //if isn't valid selection value
    else if (task_id === undefined || isNaN(parseInt(task_id)))
    {

        result = generic_e.error400;
    }
    else
    {

        let idtask = mdb.tasks.getTaskById(task_id);
        if (idtask === undefined) {
            return generic_e.error404;
        } else {
            result = {};
            result.status = 200;
            result.body = idtask;
        }

    }

    return result;
}

function updateTask(token, body, task_id) {
    //il risultato da ritornare
    let result;
    //get user
    let user = mdb.active_users.getUserByToken(token);
    if (user === null)
    {
        result = generic_e.error401;
    }
    else if (task_id === undefined || isNaN(parseInt(task_id)))
    {

        result = generic_e.error400;
    }
    //if isn't valid selection value
    else if (checkAtt(body) == false)
    {
        result = generic_e.error400;
    }
    else if (mdb.tasks.getTaskById(task_id /* === undefined */) === undefined)
    {
        result = generic_e.error404;
    } else {

        let Ttype = body.task_type;
        let Tsubj = body.subject;
        let Ttitle = body.title;
        let Tdescription = body.description;
        let Toptions = body.options;
        let Tsolutions = body.solutions;
        let index = mdb.tasks.getIndexById(task_id);
        if(mdb.tasks[index].owner.email === user.email){
            mdb.tasks[index].update(Ttype, Tsubj, Ttitle, Tdescription, Toptions, Tsolutions);
            result = {};
            result.status = 200;
            result.body = undefined;
        }else{
            result = generic_e.error403;
        }

    }

    return result;
}

function deleteTask(token, task_id) {
    //il risultato da ritornare
    let result;
    //get user
    let user = mdb.active_users.getUserByToken(token);
    //if isn't empty
    if (user === null)
    {
        result = generic_e.error401;
    }
    else if (task_id === undefined || isNaN(parseInt(task_id)))
    {

        result = generic_e.error400;
    }
    //if isn't valid selection value
    else  if (mdb.tasks.getTaskById(task_id) === undefined)
    {
        result = generic_e.error404;
    } else {
        if(mdb.tasks.getTaskById(task_id).owner.email === user.email){
            mdb.tasks.deleteById(task_id);
            result = {};
            result.status = 200;
            result.body = undefined;
        }else{
            result = generic_e.error403;
        }

    }

    return result;
}

module.exports.getTaskslist = getTaskslist;
module.exports.createTask = createTask;
module.exports.accessSpecificTask = accessSpecificTask;
module.exports.updateTask = updateTask;
module.exports.deleteTask = deleteTask;
