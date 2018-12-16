
function makeid(len) {
    var text = ""; var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

class Active_User{
    /*
    token(string) PRIMARY KEY
    user(User) UNIQUE
    */
    constructor(user){
        this.token = makeid(2);
        this.user = user;
    }
}


class Active_Users extends Array {
	
	//ADD METHOD
    add(user) {
        var x = null;
        if (this.length === 0) {
                x = new Active_User(user);
        } else {
            if (this.find(obj => obj.user.email === user.email) === undefined) {
                x = new Active_User(user);
            }
        } if (x !== null) {
            this.push(x);
            return x.token;
        }
    }

    //GET METHODS
    filterAll() {
        //returned copy of resource
        let copy = JSON.parse(JSON.stringify(this));
        return copy;
    }
    getTokenByUser(user){
        let userFound = this.find(obj => obj.user.email === user.email);
        if (userFound !== undefined) {
            return this[this.indexOf(userFound)].token;
        } else {
            return null;
        }
    }

    getUserByToken(token){
        var x = this.find(obj => obj.token === token);
        if(x !== undefined){
            return x.user;
        }
        return null;
    }

    getTokenByUserId(id) {
        let userFound = this.find(obj => obj.user.id === parseInt(id));
        if (userFound !== undefined) {
            return this[this.indexOf(userFound)].token;
        } else {
            return null;
        }
    }
    
    //DELETE METHODS
    deleteByUser(user){
        var index = this.indexOf(this.find(obj => obj.user.email === user.email));
        if(index>=0){
            this.splice(index,1);
        } else {
            return -1;
        }
    }
    deleteById(id) {
        var index = this.indexOf(this.find(obj => obj.id === parseInt(id)));
        if(index>=0){
            this.splice(index,1);
        } else {
            return -1;
        }
    }
    //UPDATE METHODS
    updateUser(user){
        for(let i = 0; i < this.length; i++){
            if(this[i].user.id === user.id){
                this[i].user.email = user.email;
            }
        }
    }
}


module.exports = Active_Users;

