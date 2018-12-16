const mdb = require('./../mdb');
class User{
    /*
    id(integer) PRIMARY KEY
    name(string)
    surname(string)
    email(string) UNIQUE
    password(string)
    */
    constructor(id, name, surname, email, password){
        this.id = id;this.name = name; this.surname = surname; 
        this.email = email; this.password = password;
    }
    update(name, surname, email, password){
        let acceptUpdate = true;
        if (email !== "" && email !== undefined) {
            if (mdb.users.getUserByEmail(email) !== null) {
                acceptUpdate = false;
            }
        }
        if (acceptUpdate) {
            if(name !== "" && name !== undefined) this.name = name; 
            if(surname !== "" && surname !== undefined) this.surname = surname;
            if(password !== "" && password !== undefined) this.password = password; 
            if(email !== "" && email !== undefined){
                this.email = email;
                mdb.active_users.updateUser(this);
                mdb.exam_peer_reviews.updateUser(this);
                mdb.exam_submissions.updateUser(this);
                mdb.exams.updateUser(this);
                mdb.groups.updateUser(this);
                mdb.tasks.updateUser(this);
            }
            return this;
        } else {
            return -1;
        }
    }
}
class Users extends Array{
    //ADD METHOD
    add(name, surname, email, password, type){


        var x = null;
        
        //Abort return 0 if one of the fields is null
        if (name == null || surname == null || email == null || password == null) {
            return 0;
        }
        

        //First user
        if(this.length === 0){
            x = new User(0, name, surname, email, password, type);
        } else {
            if(this.find(obj => obj.email === email) === undefined){
                //Insertion in "db" and ID definition
                x = new User(this[this.length-1].id+1, name, surname, email, password, type);
            }
        }
        if(x !== null) {
            this.push(x);
        } else {
            return -1;
        }

        return this[this.length-1];
    }

    //FILTER METHODS
    filterByName(name){
        return this.filter(obj => obj.name === name);
    }

    //GET METHODS
    filterAll() {
        let copy = JSON.parse(JSON.stringify(this));
        return copy;
    }
    getIndexByEmail(email){
        return this.indexOf(this.find(obj => obj.email === email));
    }
    getUserByEmail(email){
        let userFound = this.find(obj => obj.email === email);
        if (userFound !== undefined) {
            return userFound;
        } else {
            return null;
        }
    }
    getUserById(id){
        let userFound = this.filter(obj => obj.id === id);
        if (userFound !== undefined) {
            return userFound[0];
        } else {
            return null;
        }
    }

    //DELETE METHODS
    deleteByEmail(email){
        var index = this.indexOf(this.find(obj => obj.email === email));
        if(index>=0){
            this.splice(index,1);
        }
    }
    deleteById(id){
        var index = this.indexOf(this.find(obj => obj.id === id));
        if(index>=0){
            this.splice(index,1);
        }
    }
}
module.exports = Users;