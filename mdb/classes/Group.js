var mdb = require('./../mdb');
class Group{
    /* 
    id(integer) PRIMARY KEY
    owner(User) FOREIGN KEY
    name(string) UNIQUE
    description(string)
    members(User[]) "MULTIPLE" FOREIGN KEY
    */
    constructor(id, owner, name, description, members){

        this.id = id; this.owner = owner; this.name = name; this.description = description; this.members = members;
    }
    update(name, description, members, user){
        if(name !== "" && name !== undefined) this.name = name;
        if(description !== "" && description !== undefined) this.description = description;
        if(members !== "" && members !== undefined) this.members = members;
        if(user !== "" && user !== undefined){
            if(this.owner.id === user.id){
                this.owner.email = user.email;
            }
            for(let i = 0; i < this.members.length; i++){
                if(this.members[i].id === user.id){
                    this.members[i].email = user.email;
                }
            }
        }
        mdb.exams.updateGroup(this);
        return this;
    }
    getRandomMember(user){
        do{
            var reviewer = this.members[Math.floor(Math.random()*this.members.length)];
        }while(reviewer === user);
        return reviewer;
    }
    isThere(user){//checks if a user is in the group
        var member = this.members.find(obj => obj.id === user.id);
        if(member !== undefined){
            return true;
        }
        return false;
    }
    getMembersId(){
        let members_ids = [];
        for (let i=0; i<this.members.length; i++){
            members_ids[i]=this.members[i].id;
        }
        return members_ids;
    }
    updateMember(user){

    }
}
class Groups extends Array{
    //ADD METHOD
    add(owner, name, description, members){
        var x = null; var m = [];
        if(members[0].id !== undefined && members[0].email !== undefined){
            m = members;
        }else{
            for(let i = 0; i < members.length; i++){
                if(mdb.users.getUserById(members[i]) !== undefined){
                    m.push({"id": members[i], "email": mdb.users.getUserById(members[i]).email});
                }
            }
        }
        if(this.length === 0){
            x = new Group(0, owner, name, description, m);
        }else{
            if(this.find(obj => obj.name === name) === undefined){
                x = new Group(this[this.length-1].id+1, owner, name, description, m);
            }
        }
        if(x !== null){
            this.push(x);
            return this[this.length-1];
        }else{
            return false;
        }
    }

    //UPDATE METHOD
    updateById(id, name, description, members){
        var group = this.getGroupById(id); var m = [];
        for(let i = 0; i < members.length; i++){
            if(mdb.users.getUserById(members[i]) !== undefined){
                m.push({"id": members[i], "email": mdb.users.getUserById(members[i]).email});
            }
        }
        if (group !== null&&group!==undefined){
            return group.update(name, description, m);
        } else{
            return 400;
        }
    }
    //FILTER METHODS
    filterByOwner(owner){
        return this.filter(obj => obj.owner.email === owner.email);
    }
    //GET METHODS
    getAll(){
        return this;
    }
    getIndexById(id){
        return this.indexOf(this.find(obj => obj.id === id));
    }
    getGroupById(id){
        var x = this.find(obj => obj.id === parseInt(id));
        return x;
    }
    getGroupByName(name){
        return this.find(obj => obj.name === name);
    }
    //DELETE METHODS
    deleteByName(name){
        var index = this.indexOf(this.find(obj => obj.name === name));
        if(index>=0){
            this.splice(index,1);
        }
    }
    deleteById(id){
        var index = this.indexOf(this.find(obj => obj.id === parseInt(id)));
        if(index>=0){
            this.splice(index,1);
            return 200;
        } else {
            return 404;
        }
    }
    //UPDATE METHODS
    updateUser(user){
        for(let i = 0; i < this.length; i++){
            this[i].update("","","",user);
        }
    }
}
module.exports = Groups;