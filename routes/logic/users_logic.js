
const mdb = require ('./../../mdb/mdb.js');
const errors = require('./../../schemas/errors/generic.json');
const Ajv = require('ajv');
var ajv = new Ajv();

var userInputSchema = require('./../../schemas/payloads/user_post_schema.json');

//Functions

function hasEmptyFields(body) {
	let isEmpty = false;
	if (body.name === "" 
		|| body.surname === "" 
		|| body.email === "" 
		|| body.password === "")
	{
			isEmpty = true;
	}
	return isEmpty;
}


/**
 * /users GET. As APIs specify, an array of type [User] w/o pwd fields is returned
 * @param {string} token used to verify request coming from logged user
 */
function routerGetUsers(token) {
	let requester = mdb.active_users.getUserByToken(token);
	//BETTER USER TYPE DEFINITION REQUIRED
	if (requester !== null) {
		let users = mdb.users.filterAll();
		for (let i = 0; i < users.length; i++) {
			users[i].password = undefined;
		}
		return {"status": 200, "body": users};
	} else {
		return errors.error401;
	}
}

/**
 * /users/:id GET. Gets single user once id specified. If requested user is same of Id, also password is returned
 * This function has a lot of debug comments
 * Had issues with returning a copy of the user, so that the pwd is not modified in the "database"
 * @param {string} token used to verify request coming from logged user
 * @param {number} id id of the user to return
 */
function routerGetUserById(token, id) {
	if (id === null) {
		return errors.error400;
	}
	let requester = mdb.active_users.getUserByToken(token);
	//There exist a requester
	if (requester !== null) {
		let retUser = mdb.users.getUserById(id);
		//There exist a returned user
		if (retUser !== undefined) {
			let responseUser = JSON.parse(JSON.stringify(retUser));
			//If requesting user is not the same he selected, do not include user.password
			if (responseUser.id !== requester.id) {
				responseUser.password = undefined;
				let temp = mdb.users.getUserById(id);
			}
			return {"status": 200, "body": responseUser};
		} else {
			return errors.error404;
		}
	} else {
		return errors.error401;
	}
}

/**
 * /users/:id/exams GET
 * @param {string} token 
 * @param {number} id id of the user of which to get the exams
 * @param {string} selection tyoe of content to return "created" / "assigned"
 */
function routerGetUsersExams(token, id, selection) {
	let exams = [];
	let requester = mdb.active_users.getUserByToken(token);
	if (requester !== null) {
		let specifiedUser = mdb.users.getUserById(id);
		if (specifiedUser !== undefined) {
			if (selection == 'created') {
				exams = mdb.exams.filterByOwner(mdb.users.getUserById(id));
			} else if (selection == 'assigned') {
				exams = mdb.exams.filterByAssignedId(id);
				//If assigned exams, delete task results in each taskset for
			} else {
				return errors.error400;
			}
			return {"status": 200, "body": exams};
		} else {
			return errors.error400;
		}
	} else {
		return errors.error401;
	}
}


/**
 * /users/:id/exam_submissions GET
 * @param {string} token 
 * @param {number} id 
 */
function routerGetUsersExamSubmissions(token, id) {
	let submissions = [];
	let requester = mdb.active_users.getUserByToken(token);
	if (requester !== null) {
		let specifiedUser = mdb.users.getUserById(id);
		if (specifiedUser !== undefined) {
			if (specifiedUser.id === requester.id) {
				submissions = mdb.exam_submissions.filterBySubmitter(mdb.users.getUserById(id));
				return {"status": 200, "body": submissions};
			} else {
				return errors.error401;
			}
		} else {
			return errors.error400;
		}
	} else {
		return errors.error401;
	}
}

/**
 * /users POST. Implements users' subscription
 * @param {object} postBody 
 */
function routerPostUsers(postBody) {
	
	let validate = ajv.compile(userInputSchema);
	  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (!validate(postBody) || hasEmptyFields(postBody)) {
		return errors.error400;
	} else if(re.test(postBody.email)) {
		let name = postBody.name;
		let surname = postBody.surname;
		let email = postBody.email;
		let password = postBody.password;
		let type = postBody.type;
		let result = mdb.users.add(name, surname, email, password, type);
		if (result === -1) {
			return errors.error400;
		} else {
			return {"status": 201, "body": result};
		}
	}else{
		return errors.error400;
	}
}

/**
 * Updates
 * @param {*} token 
 * @param {*} putBody 
 */
function routerUpdateUser(token, putBody) {
	let validate = ajv.compile(userInputSchema);
	let requester = mdb.active_users.getUserByToken(token);
	
	if (!validate(putBody)) {
		return errors.error400;
	}
	if (requester === null) {
		return errors.error401;
	} else {
		let name = putBody.name;
		let surname = putBody.surname;
		let email = putBody.email;
		let password = putBody.password;

		let updatedUser = mdb.users[mdb.users.getIndexByEmail(requester.email)].update(name, surname, email, password);
		if (updatedUser !== -1) {
			return {"status": 200, "body": "user updated"};
		} else {
			//User changed email with already existing one
			return errors.error400;
		}
	}
}



module.exports.routerGetUsers = routerGetUsers;
module.exports.routerPostUsers = routerPostUsers;
module.exports.routerUpdateUser = routerUpdateUser;
module.exports.routerGetUserById = routerGetUserById;
module.exports.routerGetUsersExams = routerGetUsersExams;
module.exports.routerGetUsersExamSubmissions = routerGetUsersExamSubmissions;