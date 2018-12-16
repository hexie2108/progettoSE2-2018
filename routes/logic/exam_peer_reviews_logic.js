const mdb = require ('./../../mdb/mdb');
const  generic_e = require('./../../schemas/errors/generic.json');
const  review_e = require('./../../schemas/errors/review.json');
const Ajv = require('ajv');
var ajv = new Ajv();

/**
 * requires an exam_review object with an id reffering to a submission and adds it to the mdb
 * @param {string} token 
 * @param {object} exam_submission 
 * @returns {object} copy of created exam submission or error
 */
function insert_exam_peer_review(token, exam_review){
    var now = new Date();
	var scheck = ajv.validate(require('./../../schemas/payloads/exam_peer_review_post.json'), exam_review);
	if(scheck){//se il payload ha un formato valido
		var user = mdb.active_users.getUserByToken(token);
		if(user !== null){//se l'utente loggato esiste
			var ref_sub = mdb.exam_submissions.getExamSubmissionById(exam_review.ref_submission);
			if(ref_sub !== undefined){//se esiste la submission
				if(now < ref_sub.ref_exam.review_deadline){//se è entro la data limite
                    var idx = mdb.exam_peer_reviews.getIndexByUserAndSubmission(user, ref_sub);
					if(idx >= 0){//se è stato assegnato come reviewer
						if(mdb.exam_peer_reviews[idx].review === ""){//se non ha già submittato una review
							var review = mdb.exam_peer_reviews[idx].update(exam_review.review, "", "");
							return {"status": 201, "body": review};
						}else{//there's already a review
							return  review_e.existent_review;
						}
					}else{//the user is not the reviewer
						return  generic_e.error401;
					}
				}else{//the deadline expired
					return  review_e.expired_deadline;
				}
			}else{//the submission does not exist
				return  generic_e.error404;
			}
		}else{//the token is not correct
			return  generic_e.error401;
		}
	}else{//the payload doesn't respect the schema
		return  generic_e.error400;
	}
}


/**
 * Serves as logic response to PUT call to /exam_peer_review/:id
 * @param {*} token token of calling user
 * @param {*} id id of review to update
 */
function routerUpdateReview(token, id, updatedReview){

	if (arguments.length !== 3 ) {
		return generic_e.error400;
	}

	let requester = mdb.active_users.getUserByToken(token);
	//Index call returns actual saved object to be modified
	let dataIndex = mdb.exam_peer_reviews.getIndexById(id);
	//Review to update not found
	if (dataIndex === -1) {
		return generic_e.error404;
	}
	
	let examReviewToUpdate = mdb.exam_peer_reviews[dataIndex];
	let schemaCheck = ajv.validate(require('./../../schemas/payloads/exam_peer_review_put.json'), updatedReview);

	//Input not valid
	if (!schemaCheck) {
		return generic_e.error400;
	}
	//Requester non logged or non reviewer
	if (!(requester !== null && requester.id === examReviewToUpdate.reviewer.id)) {
		return generic_e.error401;
	}
	//Requester does not have review yet
	if(examReviewToUpdate.review === ""){
		return generic_e.error400;
	}

	//Actual code
	let res = examReviewToUpdate.update(updatedReview, "");
	return {"status": 200, "body": res};
}

/**
 * gets the list of reviews, there are two type of reviews that can be selected:
 * - created: the ones the user wrote
 * - received: the ones associated with the user's submissions
 * @param {*} token token of calling user
 * @param {*} type type of reviews to display
 */
function display_exam_peer_reviews_list(token, type){
	if(token === undefined || type === undefined){
		return  generic_e.error400;
	}
	var user = mdb.active_users.getUserByToken(token); //mi prendo l'utente attivo relativo al token
	if(user !== null){
		if(type === "created"){
			return {"status": 200, "body": mdb.exam_peer_reviews.filterBySubmitter(user)};
		}else if(type === "received"){
			return {"status": 200, "body": mdb.exam_peer_reviews.filterByExamSubmitter(user)};
		}else{
			return  generic_e.error400;
		}
	}else{
		return  generic_e.error401;
	}
}

/**
 * delete review by id
 * @param {type} token
 * @param {type} review_id
 * @returns {nm$_generic.module.exports.error401|nm$_generic.exports.error401|nm$_generic.exports.error404|nm$_generic.module.exports.error404|nm$_exam_peer_reviews_logic.delete_exam_peer_review.result|nm$_generic.module.exports.error400|nm$_generic.exports.error400|delete_exam_peer_review.result}
 */
function delete_exam_peer_review(token, review_id){
        
        
         //il risultato da ritornare
        let result;
        //get user
        let user = mdb.active_users.getUserByToken(token);
        //if isn't empty
        if (user === null)
        {
                result = generic_e.error401;
        }
        //if isn't valid id
        else if (review_id === undefined || isNaN(parseInt(review_id)))
        {

                result = generic_e.error400;
        }

        else
        {
                //get tale review
                let review = mdb.exam_peer_reviews.findById(parseInt(review_id));
                //se non esiste review con tale id
                if (review === undefined)
                {
                        result = generic_e.error404;
                }
                else
                {
                        //elimina review
                        mdb.exam_peer_reviews.deleteById(parseInt(review_id));

                        result = {};
                        result.status = 204;
                }
        }
        return result;
        
}

function getPeerReviewById(token,id){
	if (token !== undefined && token !== null && id !== null && id !== undefined){
		var user = mdb.active_users.getUserByToken(token);
		if (user !== null){
			var peerReview = mdb.exam_peer_reviews.findById(id);
			if (peerReview!== null && peerReview!==undefined && peerReview.review !== ""){
				return {"status": 200, "body":peerReview};
			} else {
				return generic_e.error404;
			}
		}else{
			return generic_e.error401;
		}
	} else {
		return generic_e.error401;
	}
}

module.exports.insert_exam_peer_review = insert_exam_peer_review;
module.exports.routerUpdateReview = routerUpdateReview;
module.exports.display_exam_peer_reviews_list = display_exam_peer_reviews_list;
module.exports.getPeerReviewById = getPeerReviewById;
module.exports.delete_exam_peer_review = delete_exam_peer_review;