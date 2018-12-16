const mdb = require ('../mdb/mdb.js');
const tasks = require('./../routes/logic/task_logic.js');
var Ajv = require('ajv');
var ajv = new Ajv();

test('dummy test', () => {
    expect(3).toBe(3);
});

test('Get list of all tasks.', () => {
    let token = mdb.active_users[0].token;
    let result = tasks.getTaskslist(token, "all").body.body;
    var check = ajv.validate(require('./../schemas/payloads/tasks_array_schema.json'), result);
    expect(check).toBe(true);
});

test('Get list of created tasks.', () => {
    let token = mdb.active_users[1].token;
    let result = tasks.getTaskslist(token, "created").body.body;
    var check = ajv.validate(require('./../schemas/payloads/tasks_array_schema.json'), result);
    var car = true;
    if(check){
        for (let i=0; i<result.length && car; i++){
        if(mdb.active_users[1].user.id !== result[i].owner.id) {
                car = false;
            }
        }
    }else{car = false;}
    expect(car).toBe(true);
});

test('Unauthorized user getting list of all tasks.',() => {
    let token = null;
    let result = tasks.getTaskslist(token, "all").body;
    expect(result.message).toBe('Unauthorized, missing or invalid API Key')
});

test('user making an unexpected requet of lists of tasks.',() => {
    let token = mdb.active_users[0].token;
    let result = tasks.getTaskslist(token, "234567").body;
    expect(tasks.getTaskslist(token, "234567").body.message).toBe('Bad Request');
});

test('Tasks not found when requesting for a specific users task', () => {
    let token = mdb.active_users[1].token;
    let result = tasks.getTaskslist(token, "created").body;
    if (result.length == 0 ) {
        expect(result.message).toBe("Not Found");
    }
});

test('Invalid user in creating task', () => {
    let token = undefined;
    let body = {"task_type": "cane", "subject": "gatto", "title": "lizard", "description": "gas", "options": ["opt1"], "solutions": "ababa"}
    let result = tasks.createTask(token, body).body;
    expect(result.message).toBe('Unauthorized, missing or invalid API Key')
});

test('createTask, body format is wrong', () => {
    let token = mdb.active_users[0].token;
    let body = {"task_type": undefined, "subject": "gatto", "title": "lizard", "description": "", "options": "[opt1]", "solutions": "ababa"}
    let result = tasks.createTask(token, body).body;
    expect(result.message).toBe('Bad Request');
});

test('createtask returns 200 ok', () => {
    let token = mdb.active_users[0].token;
    let body = {"task_type": "pinkiepie", "subject": "gatto", "title": "lizard", "description": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "options": ["opt1", "opt3"], "solutions": "opt3"}
    let result = tasks.createTask(token, body).body;
    var check = ajv.validate(require('./../schemas/payloads/tasks_schema.json'), result);
    expect(check).toBe(true);
});

test('accessspecifictask returns 401', () => {
    let token = null;
    let task_id = 2;
    let result = tasks.accessSpecificTask(token, task_id).body;
    expect(result.message).toBe('Unauthorized, missing or invalid API Key');
});

test('accessspecifictask undefined task id', () => {
    let token = mdb.active_users[0].token;
    let task_id = undefined;
    let result = tasks.accessSpecificTask(token, task_id).body;
    expect(result.message).toBe('Bad Request');
});

test('accessspecifictask NaN task id', () => {
    let token = mdb.active_users[0].token;
    let task_id = "stringa";
    let result = tasks.accessSpecificTask(token, task_id).body;
    expect(result.message).toBe('Bad Request');
});

test('updatetask user is null, return 401', () => {
    let token = null;
    let body = {"task_type": "pinkiepie", "subject": "gatto", "title": "lizard", "description": "gas", "options": ["opt1"], "solutions": "ababa"}
    let task_id = 20;
    let result = tasks.updateTask(token, body, task_id).body;
    expect(result.message).toBe("Unauthorized, missing or invalid API Key");
});

test('updateTask task_id undefined', () =>{
    let token = mdb.active_users[0].token;
    let body = {"task_type": "pinkiepie", "subject": "gatto", "title": "lizard", "description": "gas", "options": ["opt1"], "solutions": "ababa"}
    let task_id = undefined;
    let result = tasks.updateTask(token, body, task_id).body;
    expect(result.message).toBe("Bad Request")
});

test('updateTask task_id NaN', () => {
    let token = mdb.active_users[0].token;
    let body = {"task_type": "pinkiepie", "subject": "gatto", "title": "lizard", "description": "gas", "options": ["opt1"], "solutions": "ababa"}
    let task_id = 'stringa';
    let result = tasks.updateTask(token, body, task_id).body;
    expect(result.message).toBe("Bad Request")
});

test('updateTask, body format wrong', () => {
    let token = mdb.active_users[0].token;
    let body = {"task_type": undefined, "subject": '', "title": "lizard", "description": "gas", "options": ["opt1"], "solutions": "ababa"}
    let task_id = 'stringa';
    let result = tasks.updateTask(token, body, task_id).body;
    expect(result.message).toBe("Bad Request")
});

test('updateTask, task not found', () => {
    let token = mdb.active_users[0].token;
    let body = {"task_type": "pinkiepie", "subject": "gatto", "title": "lizard", "description": "gas", "options": ["opt1"], "solutions": "ababa"}
    let task_id = 99999;
    let result = tasks.updateTask(token, body, task_id).body;
    expect(result.message).toBe("Not Found")
});

test('updateTask, returns 200', () => {
    let token = mdb.active_users[0].token;
    let body = {"task_type": "pinkiepie", "subject": "gatto", "title": "lizard", "description": "gas", "options": ["opt1", "opt2"], "solutions": "opt1"}
    let task_id = 0;
    let result = tasks.updateTask(token, body, task_id).status;
    expect(result).toBe(200)
});

test('deleteTask, user is null', () => {
    let token = null
    let task_id = 0
    let result = tasks.deleteTask(token, task_id).body
    expect(result.message).toBe("Unauthorized, missing or invalid API Key")
});

test('deleteTask, task_id is undefined', () => {
    let token = mdb.active_users[0].token
    let task_id = undefined
    let result = tasks.deleteTask(token, task_id).body
    expect(result.message).toBe("Bad Request")
});

test('deleteTask, task_id is NaN', () => {
    let token = mdb.active_users[0].token
    let task_id = 'stringa'
    let result = tasks.deleteTask(token, task_id).body
    expect(result.message).toBe("Bad Request")
});

test('deleteTask, tasknot found', () => {
    let token = mdb.active_users[0].token
    let task_id = 99999
    let result = tasks.deleteTask(token, task_id).body
    expect(result.message).toBe("Not Found")
});

test('deleteTask, success 200', () => {
    let token = mdb.active_users[0].token
    let task_id = 0
    let result = tasks.deleteTask(token, task_id).status
    expect(result).toBe(200)
});