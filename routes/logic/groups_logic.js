const Ajv = require ('ajv');
const ajv = new Ajv();
const mdb = require ('./../../mdb/mdb.js');
const postSchema = require('../../schemas/payloads/group_post_schema.json');
const putSchema = require('./../../schemas/payloads/groups_put_schema.json');
const errors = require('./../../schemas/errors/generic.json');

/*##### FUNCTION SECTION #####*/

// GET on /groups
/**
 *  GET on /groups. This functions returns a list of all the groups if the user is logged, error otherwise
 * @param {string}token used to identify the logged user
 * @returns {*}
 */
function getGroups(token){
    const requester = mdb.active_users.getUserByToken(token);
    if (requester !== null /*&& (requester.type === 'teacher' || requester.type === 'student')*/){
        return {"status": 200, "body": mdb.groups.getAll()};
    } else {
        return errors.error401;
    }
}

// GET on /groups/:group_id
/**
 *  GET on /groups/:group_id. Returns a specific group object if the user is logged and the specified id exist, error otherwise
 * @param {string}token used to identify the logged user
 * @param {number}id used to identify a specific group
 * @returns {*}
 */
function getGroup(token, id){
    let requester = mdb.active_users.getUserByToken(token);
    if (requester !== null /*&& (requester.type === 'teacher' || requester.type === 'student')*/){
        let group = mdb.groups.getGroupById(id);
        if (group !== null&&group !==undefined){
            return {"status" : 200, "body" : group};
        } else {
            return errors.error404;
        }
    } else {
        return errors.error401;
    }
}

// POST on /groups
/**
 *  POST on /groups. Allows the user to create a group. Returns 201 if the operation is successful, 401 if the user is not logged,
 *  400 if there is an error in the body
 * @param {JSON}body of the request
 * @return {number}
 */
function createGroup(body, token){
    if(ajv.validate(postSchema, body)) {
        if (mdb.active_users.getUserByToken(token)!==null && mdb.active_users.getUserByToken(token)!==undefined) {
            var group = mdb.groups.add({
                "id": mdb.active_users.getUserByToken(token).id,
                "email": mdb.active_users.getUserByToken(token).email
            }, body.name, body.description, body.members_id);
            if (group) {
                return {"status": 201, "body": group};
            } else {
                return errors.error400;
            }
        } else {
            return errors.error401;
        }
    } else {
        return errors.error400;
    }
}

// PUT on /groups/:group_id
/**
 *  PUT on /groups/:group_id. Allows the owner of a specific group to update the group's properties
 * @param {number}id of the single group
 * @param {JSON}body of the request
 * @returns {*}
 */
function updateGroup(id, body, token){
    if (ajv.validate(putSchema, body)){
        if (mdb.groups.getGroupById(id)!==null && mdb.groups.getGroupById(id)!==undefined) {
            if (mdb.active_users.getUserByToken(token)!==null && mdb.active_users.getUserByToken(token)!==undefined) {
                if (mdb.active_users.getUserByToken(token).id === mdb.groups.getGroupById(id).owner.id) {
                    return {"status" : 200, "body" : mdb.groups.updateById(id, body.name, body.description, body.members_id)};
                } else {
                    return errors.error403;
                }
            } else {
                return errors.error401;
            }
        } else {
            return errors.error404;
        }
    }
    return errors.error400;
}

module.exports.getGroups = getGroups;
module.exports.getGroup = getGroup;
module.exports.createGroup = createGroup;
module.exports.updateGroup = updateGroup;