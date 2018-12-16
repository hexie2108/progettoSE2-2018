
const logic = require('./../routes/logic/users_logic.js');
const mdb = require('../mdb/mdb.js');
const errors = require('./../schemas/errors/generic.json');


// GET /users

test('GET /users OK case with requester valid', () => {
    let users = logic.routerGetUsers(mdb.active_users.getTokenByUserId(0)).body;
    for (let i = 0; i < users.length; i++) {
        expect(users[i]).toBeDefined();
        expect(users[i].password).toBeUndefined()
    }
});

test('GET /users NOT OK case with requester null / invalid token', () => {
    let users = logic.routerGetUsers('bananana');
    expect(users).toBe(errors.error401);
});

test('GET /users NOT OK case with non existing arguments', () => {
    let users = logic.routerGetUsers();
    expect(users).toBe(errors.error401);
});



// POST /users

test('POST /users OK case ', () => {
    let result = logic.routerPostUsers( {"name": "a", "surname": "b", "email": "gino@gmail.com", "password": "fgh"} ).body.id;
    expect(result).toBe(mdb.users.getUserByEmail('gino@gmail.com').id);
});

test('POST /users NOT OK case invalid payload (one required parameter missing)', () => {
    let result = logic.routerPostUsers( {"surname": "b", "email": "c@d.e", "password": "fgh"} );
    expect(result).toBe(errors.error400);
});

test('POST /users NOT OK case invalid payload (one required paramete rempty)', () => {
    let result = logic.routerPostUsers( {"name": "a", "surname": "", "email": "zzzz@z.z", "password": "fgh"} );
    expect(result).toBe(errors.error400);
});

test('POST /users NOT OK case invalid payload (worn email)', () => {
    let result = logic.routerPostUsers( {"name": "a", "surname": "ssss", "email": "zzzz@zz", "password": "fgh"} );
    expect(result).toBe(errors.error400);
});

test('POST /users NOT OK case user already subscribed (same email)', () => {
    let result = logic.routerPostUsers( {"name": "a", "surname": "b", "email": "c@de", "password": "fgh"} );
    expect(result).toBe(errors.error400);
});


// PUT /users
test('PUT /users OK case logged user updating info unchanged pwd', () => {
    let result = logic.routerUpdateUser(mdb.active_users.getTokenByUserId(0), {"name": "z", "surname": "z", "email": "zeta@zeta", "password": ""}).body;
    expect(result).toBe('user updated');
});

test('PUT /users OK case logged user updating info only name', () => {
    let result = logic.routerUpdateUser(mdb.active_users.getTokenByUserId(0), {"name": "BANANANANANAN", "surname": "", "email": "", "password": ""}).body;
    expect(result).toBe('user updated');
});

test('PUT /users NOT OK case logged user updating info email already registered', () => {
    let result = logic.routerUpdateUser(mdb.active_users.getTokenByUserId(1), {"name": "ac", "surname": "blah", "email": "zeta@zeta", "password": ""}).body.code;
    expect(result).toBe(400);
});

test('PUT /users NOT OK case Unlogged user updating info', () => {
    let result = logic.routerUpdateUser(mdb.active_users.getTokenByUserId(6), {"name": "z", "surname": "z", "email": "alas@imcalm", "password": ""}).body.code;
    expect(result).toBe(401);
});


// GET /users/:id

test('GET /users/:id OK case with requester != requested', () => {
    let user = logic.routerGetUserById(mdb.active_users.getTokenByUserId(0), 2).body;
    expect(user.id).toBeDefined();
    expect(user.name).toBeDefined();
    expect(user.surname).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.password).toBeUndefined();
});

test('GET /users/:id OK case SECOND REQUEST ON PREVIOUS USER WITH requester == requested (test for data cloning)', () => {
    let user = logic.routerGetUserById(mdb.active_users.getTokenByUserId(2), 2).body;
    expect(user.id).toBeDefined();
    expect(user.name).toBeDefined();
    expect(user.surname).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.password).toBeDefined();
});

test('GET /users/:id OK case with requester == requested', () => {
    let user = logic.routerGetUserById(mdb.active_users.getTokenByUserId(0), 0).body;
    expect(user.id).toBeDefined();
    expect(user.name).toBeDefined();
    expect(user.surname).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.password).toBeDefined();
});

test('GET /users/:id NOT OK case with requester not logged', () => {
    let user = logic.routerGetUserById(mdb.active_users.getTokenByUserId(1231), 0);
    expect(user).toBe(errors.error401);
});

test('GET /users/:id NOT OK case with token invalid', () => {
    let user = logic.routerGetUserById('xA67F2r2', 1);
    //Will be changed because of return error
    expect(user).toBe(errors.error401);
});

test('GET /users/:id NOT OK case with id invalid', () => {
    let user = logic.routerGetUserById(mdb.active_users.getTokenByUserId(0), 342);
    //Will be changed because of return error
    expect(user).toBe(errors.error404);
});

test('GET /users/:id NOT OK case with id null', () => {
    let user = logic.routerGetUserById(mdb.active_users.getTokenByUserId(0), null);
    //Will be changed because of return error
    expect(user).toBe(errors.error400);
});

test('GET /users/:id NOT OK case with token null', () => {
    let user = logic.routerGetUserById(null, 1);
    //Will be changed because of return error
    expect(user).toBe(errors.error401);
});



// GET /users/:id/exams

test('GET /users/:id/exams OK case with selection=created', () => {
    let result = logic.routerGetUsersExams(mdb.active_users.getTokenByUserId(0), 0, 'created');
    for (let i = 0; i < result.length; i++) {
        expect(result[i].id).toBeDefined();
        expect(result[i].owner).toBeDefined();
        expect(result[i].title).toBeDefined();
        expect(result[i].description).toBeDefined();
        expect(result[i].taskset).toBeDefined();
        expect(result[i].group).toBeDefined();
        expect(result[i].final_deadline).toBeDefined();
        expect(result[i].review_deadline).toBeDefined();
    }
});

test('GET /users/:id/exams OK case with selection=assigned', () => {
    let result = logic.routerGetUsersExams(mdb.active_users.getTokenByUserId(0), 0, 'assigned');
    for (let i = 0; i < result.length; i++) {
        expect(result[i].id).toBeDefined();
        expect(result[i].owner).toBeDefined();
        expect(result[i].title).toBeDefined();
        expect(result[i].subject).toBeDefined();
        expect(result[i].description).toBeDefined();
        expect(result[i].taskset).toBeDefined();
        expect(result[i].group).toBeDefined();
        expect(result[i].final_deadline).toBeDefined();
        expect(result[i].review_deadline).toBeDefined();
    }
});

test('GET /users/:id/exams NOT OK case with selection parameter empty', () => {
    let result = logic.routerGetUsersExams(mdb.active_users.getTokenByUserId(0), 0, '');
    expect(result).toBe(errors.error400);
});

test('GET /users/:id/exams NOT OK case with selection parameter not valid', () => {
    let result = logic.routerGetUsersExams(mdb.active_users.getTokenByUserId(0), 0, 'banana');
    expect(result).toBe(errors.error400);
});

test('GET /users/:id/exams NOT OK case with token invalid', () => {
    let result = logic.routerGetUsersExams('bananarama', 0, 'created');
    expect(result).toBe(errors.error401);
});

test('GET /users/:id/exams NOT OK case requested id invalid', () => {
    let id = 'a'; //works also with 'null' and not registered id
    let result = logic.routerGetUsersExams(mdb.active_users.getTokenByUserId(0), id, 'created');
    expect(result).toBe(errors.error400);
});



// GET /users/:id/exam_submissions

test('GET /users/:id/exam_submissions OK case only one can read only his/her submissions', () => {
    let result = logic.routerGetUsersExamSubmissions(mdb.active_users.getTokenByUserId(2), 2).body;
    for (let i = 0; i < result.length; i++) {
        expect(result[i].id).toBeDefined();
        expect(result[i].ref_exam).toBeDefined();
        expect(result[i].submitter).toBeDefined();
        expect(result[i].answer).toBeDefined();
        expect(result[i].status).toBeDefined();
    }
});

test('GET /users/:id/exam_submissions NOT OK case not authorized access', () => {
    let result = logic.routerGetUsersExamSubmissions(mdb.active_users.getTokenByUserId(0), 2);
    expect(result).toBe(errors.error401);
});

test('GET /users/:id/exam_submissions NOT OK case requested id not valid', () => {
    let id = 'banana';
    let result = logic.routerGetUsersExamSubmissions(mdb.active_users.getTokenByUserId(0), id);
    expect(result).toBe(errors.error400);
});

test('GET /users/:id/exam_submissions NOT OK case requester (token) not valid', () => {
    let id = 0;
    let result = logic.routerGetUsersExamSubmissions('banana', id);
    expect(result).toBe(errors.error401);
});

test('Hudredth case yay', () => {
    expect(100).toBe(100);
});
