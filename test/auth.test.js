
const mdb = require('../mdb/mdb.js');
const logic = require('./../routes/logic/auth_logic.js');
const errors = require('./../schemas/errors/generic.json');

// POST /auth
test('POST /auth OK case correct email and pwd of registered unlogged user', () => {
    let email = 'billy@b';
    let pwd = 'pwd1';
    expect(logic.loginFunction(email, pwd).body).toBe(mdb.active_users.getTokenByUser(mdb.users.getUserByEmail(email)));
});

test('POST /auth NOT OK case correct email and pwd of registered _logged_ user', () => {
    let email = 'gino@gino';
    let pwd = 'pwd1';
    expect(logic.loginFunction(email, pwd)).toBe(errors.error400);
});

test('POST /auth NOT OK case incorrect email (unregistered, mistyped)', () => {
    let email = 'gislno@gino';
    let pwd = 'pwd1';
    expect(logic.loginFunction(email, pwd)).toBe(errors.error400);
});

test('POST /auth NOT OK case correct email but incorrect password (empty, mistyped)', () => {
    let email = 'gino@gino';
    let pwd = 'pwd30';
    expect(logic.loginFunction(email, pwd)).toBe(errors.error400);
});

test('POST /auth NOT OK case email parameter empty, any password', () => {
    let email = '';
    let pwd = 'pwd30';
    expect(logic.loginFunction(email, pwd)).toBe(errors.error400);
});

test('POST /auth NOT OK case correct email but null password', () => {
    let email = 'gino@gino';
    let pwd = null;
    expect(logic.loginFunction(email, pwd)).toBe(errors.error400);
});

test('POST /auth NOT OK case correct email but undefined password', () => {
    let email = 'gino@gino';
    let pwd;
    expect(logic.loginFunction(email, pwd)).toBe(errors.error400);
});

test('POST /auth NOT OK case null email, whatever password', () => {
    let email = null;
    let pwd = 'bana';
    expect(logic.loginFunction(email, pwd)).toBe(errors.error400);
});

test('POST /auth NOT OK case undefined email, whatever password', () => {
    let email;
    let pwd = 'nana'
    expect(logic.loginFunction(email, pwd)).toBe(errors.error400);
});