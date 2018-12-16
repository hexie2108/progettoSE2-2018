
const mdb = require ('./../../mdb/mdb.js');
const errors = require('./../../schemas/errors/generic.json');
const Ajv = require('ajv');
var ajv = new Ajv();


function loginFunction(email, password) {
	let reqUser = mdb.users.getUserByEmail(email);
	//If user is registered
	if (reqUser !== null) {
		if (password === reqUser.password) {
			let sessionToken = mdb.active_users.add(reqUser);
			if (sessionToken !== undefined) {
				return {"status": 200, "body": sessionToken.toString()};
			} else {
				return errors.error400; //possibly user is already logged
			}
		} else {
			return errors.error400;
		}
	} else {
		return errors.error400;
	}
}

module.exports.loginFunction = loginFunction;