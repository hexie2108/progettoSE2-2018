const mdb = require ('./../../mdb/mdb');
const  generic_e = require('./../../schemas/errors/generic.json');
const Ajv = require('ajv');
const submission_e = require('./../../schemas/errors/submission.json');
var ajv = new Ajv();

/**
 * gets the list of exam_submissions, the user can select a type of exam submissions >
 * - submitted: submissions made by the user requesting the service
 * - owned: submissions relative to the owned exams
 * - toreview(TO FIX): submissions to review
 * - reviewed(TO DO): submissions that the user already reviewed
 * @param {string} token of the active user
 * @param {string} type of selection
 * @returns {object} array of exam submissions or an error
 */
function display_exam_submission_list(token, type){
	if(token === undefined || type === undefined){
		return  generic_e.error400;
	}
	var user = mdb.active_users.getUserByToken(token); //mi prendo l'utente attivo relativo al token
	if(user !== null){
		if(type === "submitted"){
			return {"status": 200, "body": mdb.exam_submissions.filterBySubmitter(user)};
		}else if(type === "owned"){
			return {"status": 200, "body": mdb.exam_submissions.filterByExamOwner(user)};
		}else if(type === "toreview" || type === "reviewed"){
			return {"status": 200, "body": mdb.exam_peer_reviews.filterExamSubmissionByReviewer(user,type)};
		}else{
			return  generic_e.error400;
		}
	}else{
		return  generic_e.error401;
	}
}

/**
 * requires an exam_submssion object with an id reffering to an exam and adds it to the mdb
 * @param {string} token 
 * @param {object} exam_submission 
 * @returns {object} copy of created exam submission or error
 */
function insert_exam_submission(token, exam_submission){
	var now = new Date();
	var scheck = ajv.validate(require('./../../schemas/payloads/exam_submission_post.json'), exam_submission);
	if(scheck){//se il payload ha un formato valido
		var user = mdb.active_users.getUserByToken(token);
		if(user !== null){//se l'utente loggato esiste
			var ref_exam = mdb.exams.getExamById(exam_submission.ref_exam);
			if(ref_exam !== undefined){//se esiste l'esame
				if(now < ref_exam.final_deadline){//se è entro la data limite
					if(ref_exam.group.isThere(user)){//se fa parte del gruppo
						if(!mdb.exam_submissions.hasSubmission(ref_exam, user)){//se non ha già submittato per l'esame
							var submission = mdb.exam_submissions.add(ref_exam, user, exam_submission.answers, exam_submission.status);
							//after I add the exam submission I serch for a suitable reviewer
							do{
								var r_member = ref_exam.group.getRandomMember(user);
							}while(mdb.exam_peer_reviews.hasReview(ref_exam,r_member))
							mdb.exam_peer_reviews.add(r_member, submission, "");
							return {"status": 201, "body": submission};
						}else{//there's already a submission
							return  submission_e.existent_submission;
						}
					}else{//the user is not in the group
						return  generic_e.error401;
					}
				}else{//the deadline expired
					return  submission_e.expired_deadline;
				}
			}else{//the exam does not exist
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
 * displays the details of the requested exam_submission, this works only if you're the submitter or
 * the owner of the exam the submission refers to
 * @param {string} token 
 * @param {int} id
 * @returns {object} an exam submission or an error 
 */
function display_exam_submission(token, id){
	var user = mdb.active_users.getUserByToken(token); //mi prendo l'utente attivo relativo al token
	if(user !== null){
		var e_sub = mdb.exam_submissions.getExamSubmissionById(id);
		if(e_sub !== undefined){
			//controllo se è il submitter
			if(e_sub.submitter.id === user.id){
				//prendo la submission
				return {"status": 200, "body": e_sub};
			}
			//controllo se è l'owner dell'esame a cui appartiene la submission
			if(e_sub.ref_exam.owner.id === user.id){ 
				return {"status": 200, "body": e_sub};
			}
			//controllo se è un reviewer della submission
			if(mdb.exam_peer_reviews.getReviewerByExamSubmission(e_sub).id === user.id){
				return {"status": 200, "body": e_sub};
			}
			return  generic_e.error401;
		}else{
			return  generic_e.error404;
		}
	}else{
		return  generic_e.error401;
	}
}

/**
 * 
 * @param {string} token 
 * @param {int} id 
 * @param {object} updated_submission 
 * @returns {object} the updated version of the submission or an error
 */
function update_exam_submission(token, id, updated_submission){
	var now = new Date();
	var scheck = ajv.validate(require('./../../schemas/payloads/exam_submission_put.json'), updated_submission);
	if(scheck){//se il payload ha un formato valido
		var user = mdb.active_users.getUserByToken(token);
		if(user !== null){//se l'utente loggato esiste
			var ref_sub = mdb.exam_submissions.getExamSubmissionById(id);
			if(ref_sub !== undefined){//se esiste la submission
				if(ref_sub.submitter.id === user.id){//se è submitter della submission
					if(now < ref_sub.ref_exam.final_deadline){//se è entro la data limite
						var index = mdb.exam_submissions.getIndexById(id)
						var updated = mdb.exam_submissions[mdb.exam_submissions.getIndexById(id)].update(updated_submission.answers,updated_submission.status);
						return {"status": 200, "body": updated};
					}else{
						return  submission_e.expired_deadline;
					}
				}else{//se non è submitter
					return  generic_e.error401;
				}
			}else{//the requested resource does not exists
				return  generic_e.error404;
			}
		}else{//the user has incorrect token
			return  generic_e.error401;
		}
	}else{//the payload has not a valid format
		return  generic_e.error400;
	}
}

/**
 * 
 * @param {string} token 
 * @param {int} id 
 * @param {object} evaluation
 * @returns {object} the updated version of the submission or an error
 */
function assign_submission_evaluation(token, id, updated_submission){
	var now = new Date();
	var scheck = ajv.validate(require('./../../schemas/payloads/exam_submission_patch.json'), updated_submission);
	if(scheck){//se il payload ha un formato valido
		var user = mdb.active_users.getUserByToken(token);
		if(user !== null){//se l'utente loggato esiste
			var ref_sub = mdb.exam_submissions.getExamSubmissionById(id);
			if(ref_sub !== undefined){//se esiste la submission
				if(ref_sub.ref_exam.owner.id === user.id){
					var updated = mdb.exam_submissions[mdb.exam_submissions.getIndexById(id)].update("","",updated_submission.evaluation);
					return {"status": 200, "body": updated};
				}else{//se non è owner
					return  generic_e.error401;
				}
			}else{//the requested resource does not exists
				return  generic_e.error404;
			}
		}else{//the user has incorrect token
			return  generic_e.error401;
		}
	}else{//the payload has not a valid format
		return  generic_e.error400;
	}
}
/**
 * returns the reviews array of a submission, this works if you're the creator of the submission,
 * the owner of the exam regarding the submission or one of the exam assignees
 * @param {string} token 
 * @param {int} id
 * @returns {object} reviews array of the selected submission or an error 
 */
function exam_submission_peer_review_list(token, id){
	var user = mdb.active_users.getUserByToken(token); //mi prendo l'utente attivo relativo al token
	if(user !== null){//controllo che l'utente sia loggato
		var ref_sub = mdb.exam_submissions.getExamSubmissionById(id);
		if(ref_sub !== undefined){//se esiste la submission
			if(ref_sub.submitter.id === user.id){//se è submitter della submission
				return {"status": 200, "body": mdb.exam_peer_reviews.filterPeerReviewBySubmission(ref_sub)};
			}else if(ref_sub.ref_exam.owner.id === user.id){
				return {"status": 200, "body": mdb.exam_peer_reviews.filterPeerReviewBySubmission(ref_sub)};
			}else if(ref_sub.ref_exam.group.isThere(user)){
				return {"status": 200, "body": mdb.exam_peer_reviews.filterPeerReviewBySubmission(ref_sub)};
			}else{
				return  generic_e.error400;
			}
		}else{//the submissions does not exist
			return  generic_e.error404;
		}
	}else{//incorrect token
		return  generic_e.error401;
	}
}

module.exports.display_exam_submission = display_exam_submission;/**/
module.exports.display_exam_submission_list = display_exam_submission_list;/**/
module.exports.exam_submission_peer_review_list = exam_submission_peer_review_list;/**/
module.exports.insert_exam_submission = insert_exam_submission;/**/
module.exports.update_exam_submission = update_exam_submission;/**/
module.exports.assign_submission_evaluation = assign_submission_evaluation;
