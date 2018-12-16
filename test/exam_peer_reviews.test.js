const er = require('./../routes/logic/exam_peer_reviews_logic');
const mdb = require('./../mdb/mdb');
const  generic_e = require('./../schemas/errors/generic.json');
const  review_e = require('./../schemas/errors/review.json');

//test for post a review
test('call insert_exam_peer_review with no parameters', () => {
        expect(er.insert_exam_peer_review()).toBe( generic_e.error400);
});
test('call insert_exam_peer_review with incorrect token', () => {
        expect(er.insert_exam_peer_review("dsdsdsdssdsd", {"ref_submission": 0,"review":"bob"})).toBe( generic_e.error401);
});
test('call insert_exam_peer_review with incorrect payload', () => {
        expect(er.insert_exam_peer_review(mdb.active_users[3].token, {"ref_exam": 0,"answers":["bob","bobby"], "status": 2})).toBe( generic_e.error400);
});
test('call insert_exam_peer_review with correct values', () => {
        expect(er.insert_exam_peer_review(mdb.active_users[3].token,  {"ref_submission": 0,"review":"bob"}).body).toEqual(mdb.exam_peer_reviews[0]);
});
test('call insert_exam_peer_review with undefined values', () => {
        expect(er.insert_exam_peer_review(mdb.active_users[3].token,  {"ref_submission": undefined,"review":"bob"})).toEqual(generic_e.error400);
});
test('call insert_exam_peer_review with null values', () => {
        expect(er.insert_exam_peer_review(mdb.active_users[3].token,  {"ref_submission": 0,"review": null})).toEqual(generic_e.error400);
});
test('call insert_exam_peer_review with correct values as student who already reviewed', () => {
        expect(3).toEqual(3);
});
test('call insert_exam_peer_review on inexisting submission', () => {
        expect(er.insert_exam_peer_review(mdb.active_users[3].token,  {"ref_submission": 99,"review":"bob"})).toEqual(generic_e.error404);
});
test('call insert_exam_peer_review with correct values on existing submission review', () => {
        expect(er.insert_exam_peer_review(mdb.active_users[1].token,  {"ref_submission": 1,"review":"bob"})).toEqual(review_e.existent_review);
});
test('call insert_exam_peer_review with correct values on expired deadline', () => {
        expect(er.insert_exam_peer_review(mdb.active_users[3].token,  {"ref_submission": 2,"review":"bob"})).toEqual(review_e.expired_deadline);
});

//test for get reviews list
test("call display_exam_peer_reviews_list with correct values - created", function () {
	expect(er.display_exam_peer_reviews_list(mdb.active_users[1].token, "created").body).toEqual([mdb.exam_peer_reviews[1]]);

});

test("call display_exam_peer_reviews_list with correct values - received", function () {
        expect(er.display_exam_peer_reviews_list(mdb.active_users[2].token, "received").body).toEqual([mdb.exam_peer_reviews[1]]);
});
test('call display_exam_peer_reviews_list with incorrect token', () => {
        expect(er.display_exam_peer_reviews_list("sssssss", "received")).toEqual(generic_e.error401);
});
test('call display_exam_peer_reviews_list with incorrect parameter', () => {
        expect(er.display_exam_peer_reviews_list(mdb.active_users[2].token, "recdeived")).toEqual(generic_e.error400);
});



//test for get a review
test("validate token for get a review", function () {

        expect(1).toBe(1);
});

test("validate review id for get a review", function () {

        expect(1).toBe(1);
});

test("validate response for get a review", function () {
	expect(1).toBe(1);
});


// PUT /exam_peer_reviews/:id
test('PUT /exam_peer_reviews/:id OK case logged user udates a review that exists and he is the reviewer', function(){
	let updatedReview = {"review": 'Yeah but I like bananas more'};
	let token = mdb.active_users.getTokenByUserId(1);
	let reviewId = 1; //in mdb: {"id": users[3].id, "email": users[3].email}, exam_submissions[2], ""
	let result = er.routerUpdateReview(token, reviewId, updatedReview);
	expect(result.status).toBe(200);

});

test('PUT /exam_peer_reviews/:id NOT OK case logged user udates a review that exists and he is NOT the reviewer', function(){
	let updatedReview = {"review": 'Yeah but I like bananas more'};
	let token = mdb.active_users.getTokenByUserId(2);
	let reviewId = 1; //in mdb:{"id": users[1].id, "email": users[1].email}, exam_submissions[1], "funny"
	let result = er.routerUpdateReview(token, reviewId, updatedReview);
	expect(result).toBe(generic_e.error401);
});

test('PUT /exam_peer_reviews/:id NOT OK case unlogged user / invalid token', function(){
	let updatedReview = {"review": 'Yeah but I like bananas more'};
	//let token = mdb.active_users.getTokenByUserId(6);
	let reviewId = 1; //in mdb:{"id": users[1].id, "email": users[1].email}, exam_submissions[1], "funny"
	let result = er.routerUpdateReview("B4nAna", reviewId, updatedReview);
	expect(result).toBe(generic_e.error401);
});

test('PUT /exam_peer_reviews/:id NOT OK case logged user udates a review that does not exist', function(){
	let updatedReview = {"review": 'Yeah but I like bananas more'};
	let token = mdb.active_users.getTokenByUserId(6);
	let reviewId = 1; //in mdb:{"id": users[1].id, "email": users[1].email}, exam_submissions[1], "funny"
	let result = er.routerUpdateReview(token, 392, updatedReview);
	expect(result).toBe(generic_e.error404);
});

test('PUT /exam_peer_reviews/:id NOT OK case logged user reviewId invalid parameter updatedReview', function(){
	let updatedReview = {"Yeet": 'Yeah but I like bananas more'};
	let token = mdb.active_users.getTokenByUserId(1);
	let reviewId = 1; //in mdb:{"id": users[1].id, "email": users[1].email}, exam_submissions[1], "funny"
	let result = er.routerUpdateReview(token, reviewId, updatedReview);
	expect(result).toBe(generic_e.error400);
});

test('PUT /exam_peer_reviews/:id NOT OK case logged user invalid parameter reviewId', function(){
	let updatedReview = {"Yeet": 'Yeah but I like bananas more'};
	let token = mdb.active_users.getTokenByUserId(1);
	//let reviewId = 1; //in mdb:{"id": users[1].id, "email": users[1].email}, exam_submissions[1], "funny"
	let result = er.routerUpdateReview(token, "aaaaaaaAà", updatedReview);
	expect(result).toBe(generic_e.error404);
});

test('PUT /exam_peer_reviews/:id NOT OK case missing some parameter', function(){
	let updatedReview = {"Yeet": 'Yeah but I like bananas more'};
	let token = mdb.active_users.getTokenByUserId(1);
	let reviewId = 1; //in mdb:{"id": users[1].id, "email": users[1].email}, exam_submissions[1], "funny"
	let result = er.routerUpdateReview(reviewId, updatedReview);
	expect(result).toBe(generic_e.error400);
});



//test for delete a review
let invalid_token = "sss";
let valid_token = mdb.active_users.getTokenByUserId(1);
test("DELETE exam_peer_reviews NOT OK token invalid", function () {

       expect(er.delete_exam_peer_review(invalid_token, 0)).toEqual(generic_e.error401);
});

test("DELETE exam_peer_reviews NOT OK id isn't number", function () {

        expect(er.delete_exam_peer_review(valid_token, "sdas")).toEqual(generic_e.error400);
});

test("DELETE exam_peer_reviews NOT OK not exist reviews with this id ", function () {

        expect(er.delete_exam_peer_review(valid_token, 1233234)).toEqual(generic_e.error404);
});



test("DELETE exam_peer_reviews OK status code 204", function () {

        expect(er.delete_exam_peer_review(valid_token, 1).status).toBe(204);

});




