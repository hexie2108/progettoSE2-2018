const es = require('./../routes/logic/exam_submission_logic');
const mdb = require('./../mdb/mdb');
const generic_e = require('./../schemas/errors/generic.json');
const submission_e = require('./../schemas/errors/submission.json');

test('dummy test', () => {
    expect(3).toBe(3);
});
//display_exam_submission() tests/*X*/
test('call display_exam_submission with no paramaters', () => {
    expect(es.display_exam_submission()).toBe(generic_e.error401);
});
test('call display_exam_submission with no incorrect token', () => {
    expect(es.display_exam_submission("dsddsddddddddddddddd", 1)).toBe(generic_e.error401);
});
test('call display_exam_submission with no incorrect id', () => {
    expect(es.display_exam_submission(mdb.active_users[0].token, 928928)).toBe(generic_e.error404);
});
test('call display_exam_submission with correct token and id(as owner)', () => {
    expect(es.display_exam_submission(mdb.active_users.getTokenByUserId(1), 0).body).toBe(mdb.exam_submissions[0]);
});
test('call display_exam_submission with correct token and id(as submitter)', () => {
    expect(es.display_exam_submission(mdb.active_users[1].token, 0).body).toBe(mdb.exam_submissions[0]);
});
test('call display_exam_submission with correct token and id(as reviewer)', () => {
    expect(es.display_exam_submission(mdb.active_users[3].token, 0).body).toBe(mdb.exam_submissions[0]);
});

//display_exam_submission_list() tests/*X*/
test('call display_exam_submission_list with no parameters', () => {
    expect(es.display_exam_submission_list()).toBe(generic_e.error400);
});
test('call display_exam_submission_list with incorrect token', () => {
    expect(es.display_exam_submission_list("dsdsdsdssdsd", "toreview")).toBe(generic_e.error401);
});
test('call display_exam_submission_list with just the token', () => {
    expect(es.display_exam_submission_list(mdb.active_users[0].token)).toEqual(generic_e.error400);
});
test('call display_exam_submission_list with incorrect query param', () => {
    expect(es.display_exam_submission_list(mdb.active_users[3].token, "torevifew")).toBe(generic_e.error400);
});
test('call display_exam_submission_list with correct values (select=owned)', () => {
    expect(es.display_exam_submission_list(mdb.active_users[0].token, "owned").body).toEqual(mdb.exam_submissions);
});
test('call display_exam_submission_list with correct values (select=toreview)', () => {
    expect(es.display_exam_submission_list(mdb.active_users[3].token, "toreview").body).toEqual([mdb.exam_submissions[0],mdb.exam_submissions[2]]);
});
test('call display_exam_submission_list with correct values (select=reviewed)', () => {
    expect(es.display_exam_submission_list(mdb.active_users[3].token, "reviewed").body).toEqual([]);
});

//insert_exam_submission() tests
test('call insert_exam_submission with no parameters', () => {
    expect(es.insert_exam_submission()).toBe(generic_e.error400);
});
test('call insert_exam_submission with incorrect token', () => {
    expect(es.insert_exam_submission("dsdsdsdssdsd", {"ref_exam": 0,"answers":["bob","bobby"], "status": "on hold"})).toBe(generic_e.error401);
});
test('call insert_exam_submission with incorrect payload', () => {
    expect(es.insert_exam_submission(mdb.active_users[2].token, {"ref_exam": 0,"answers":["bob","bobby"], "status": 2})).toBe(generic_e.error400);
});
test('call insert_exam_submission with correct values on existent submission', () => {
    expect(es.insert_exam_submission(mdb.active_users[2].token,  {"ref_exam": 0,"answers":["bob","bobby"], "status": "on hold"})).toEqual(submission_e.existent_submission);
});
test('call insert_exam_submission with correct values as student out of group', () => {
    expect(es.insert_exam_submission(mdb.active_users[0].token,  {"ref_exam": 0,"answers":["bob","bobby"], "status": "heck"})).toEqual(generic_e.error401);
});
test('call insert_exam_submission on inexisting exams', () => {
    expect(es.insert_exam_submission(mdb.active_users[2].token,  {"ref_exam": 99,"answers":["dds","d"], "status": "heck"})).toEqual(generic_e.error404);
});
test('call insert_exam_submission with correct values on expired deadline', () => {
    expect(es.insert_exam_submission(mdb.active_users[3].token,  {"ref_exam": 1,"answers":["dds","d"], "status": "heck"})).toEqual(submission_e.expired_deadline);
});

//update_exam_submission() tests
test('call update_exam_submission with no parameters', () => {
    expect(es.update_exam_submission()).toBe(generic_e.error400);
});
test('call update_exam_submission with incorrect token', () => {
    expect(es.update_exam_submission("dsdsdsdssdsd", 0, {"ref_exam": 0,"answers":["bob","bobby"], "status": "on hold"})).toBe(generic_e.error401);
});
test('call update_exam_submission with incorrect payload', () => {
    expect(es.update_exam_submission(mdb.active_users[1].token, 0, {"ref_exam": 0})).toBe(generic_e.error400);
});
test('call update_exam_submission with correct values as submitter', () => {
    expect(es.update_exam_submission(mdb.active_users[1].token,  0, {"answers":["bob","bobbbbbby"], "status": "completed"}).body).toEqual(mdb.exam_submissions[0]);
});
//check for update on expired deadline
test('call update_exam_submission with correct values as owner of the exam', () => {
    expect(es.assign_submission_evaluation(mdb.active_users[0].token,  0, {"evaluation": "good"}).body).toEqual(mdb.exam_submissions[0]);
});

//exam_submission_peer_review_list() tests
test('call exam_submission_peer_review_list with incorrect token', () => {
    expect(es.exam_submission_peer_review_list("dsdsdsdssdsd")).toBe(generic_e.error401);
});
test('call exam_submission_peer_review_list with correct values as submitter', () => {
    expect(es.exam_submission_peer_review_list(mdb.active_users[1].token,  0).body).toEqual([mdb.exam_peer_reviews[0]]);
});
test('call exam_submission_peer_review_list with correct values as submitter - 2', () => {
    expect(es.exam_submission_peer_review_list(mdb.active_users[2].token,  1).body).toEqual([mdb.exam_peer_reviews[1]]);
});
test('call exam_submission_peer_review_list with correct values as group member', () => {
    expect(es.exam_submission_peer_review_list(mdb.active_users[3].token,  1).body).toEqual([mdb.exam_peer_reviews[1]]);
});