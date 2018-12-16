const groups = require('./../routes/logic/groups_logic.js');
const mdb = require('./../mdb/mdb.js');
const generic_e = require('./../schemas/errors/generic.json');

test('dummy test', () => {
    expect(3).toBe(3);
});

// getGroups testing
test('call getGroups as not logged user', ()=>{
    expect(groups.getGroups()).toBe(generic_e.error401);
});
test('call getGroups as logged user', ()=>{
    expect(groups.getGroups(mdb.active_users[0].token).body).toBe(mdb.groups);
});

// getGroup testing
test('call getGroup as not logged user, no id', ()=>{
    expect(groups.getGroup()).toBe(generic_e.error401);
});
test('call getGroup as logged user, wrong id', ()=>{
    expect(groups.getGroup(mdb.active_users[0].token, 9057)).toBe(generic_e.error404);
});
test('call getGroup as logged user, correct id', ()=>{
    expect(groups.getGroup(mdb.active_users[0].token, 0).body).toBe(mdb.groups[0]);
});
test('call getGroup wrong token, correct id', ()=>{
    expect(groups.getGroup('cnjcd34J', 0)).toBe(generic_e.error401);
});
test('call getGroup wrong token, wrong id', ()=>{
    expect(groups.getGroup('hjdfh78s', 9075)).toBe(generic_e.error401);
});

// createGroup testing
test('call createGroup wrong payload', ()=>{
    expect(groups.createGroup({"name": "hfsb", "description": "hfjdi"}).status).toBe(400);
});
test('call createGroup correct payload', ()=>{
    expect(groups.createGroup({"name": "hfsb", "description": "hfjdi", "members_id": [mdb.groups[0].members[0].id]}, mdb.active_users[0].token).status).toBe(201);
});
test('call createGroup with non-existing user', ()=>{
    expect(groups.createGroup({"token": "hhgvj68H", "name": "hfsb", "description": "hfjdi", "members_id": [mdb.groups[0].members[0].id]}).status).toBe(401);
});

// updateGroup testing
test('call updateGroup wrong id, wrong payload', ()=>{
    expect(groups.updateGroup(987, {"nkme":545}).status).toBe(400);
});
test('call updateGroup correct id, wrong payload', ()=>{
    expect(groups.updateGroup(0, {"nome":545, "desh":"string", "members_id": ["test", "error"]}).status).toBe(400);
});
test('call updateGroup correct id, correct payload', ()=>{
    expect(groups.updateGroup(0, {"name":"hgh", "description": "hfjvbj", "members_id": []}, mdb.active_users[0].token).status).toBe(200);
});
test('call updateGroup wrong id, correct payload', ()=>{
    expect(groups.updateGroup(689, {"name":"hgh", "description": "hfjvbj", "members_id": []})).toBe(generic_e.error404);
});
test('call updateGroup wrong owner, correct payload and id', ()=>{
    expect(groups.updateGroup(0, {"name":"hgh", "description": "hfjvbj", "members_id": []}, mdb.active_users[2].token).status).toBe(403);
});
test('call updateGroup non-existing user, correct payload and id', ()=>{
    expect(groups.updateGroup(0, {"name":"hgh", "description": "hfjvbj", "members_id": []}).status).toBe(401);
});