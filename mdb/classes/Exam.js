const mdb = require('./../mdb');
class Exam {
        /* 
         id(integer) PRIMARY KEY
         owner({id, email}) FOREIGN KEY
         title(string)
         description(string)
         taskset(taskInExam[]) "MULTIPLE" FOREIGN KEY
         group(Group) FOREIGN KEY
         final_deadline(timestamp)
         review_deadline(timestamp)
         */
        constructor(id, owner, title, description, taskset, group, final_deadline, review_deadline) {
                this.id = id;
                this.owner = owner;
                this.title = title;
                this.description = description;
                this.taskset = taskset;
                this.group = group;
                this.final_deadline = final_deadline;
                this.review_deadline = review_deadline;
        }
        update(title, description, taskset, group, final_deadline, review_deadline, owner_email, task) {
                if(title !== "" && title !== undefined)  this.title = title;
                if(description !== "" && description !== undefined)  this.description = description;
                if(taskset !== "" && taskset !== undefined)  this.taskset = taskset;
                if(group !== "" && group !== undefined)  this.group = group;
                if(final_deadline !== "" && final_deadline !== undefined)  this.final_deadline = final_deadline;
                if(review_deadline !== "" && review_deadline !== undefined)  this.review_deadline = review_deadline;
                if(owner_email !== "" && owner_email !== undefined)  this.owner.email = owner_email;
                if(task !== "" && task !== undefined){
                        for(let i = 0; i < this.taskset.length; i++){
                                if(this.taskset[i].id === task.id){
                                        this.taskset[i].text = task.description;
                                }
                        }
                }
                mdb.exam_submissions.updateRef_Exam(this);
                return this;
        }
}
class Exams extends Array {
        //ADD METHOD
        add(owner, title, description, taskset, group, final_deadline, review_deadline) {
                var x = null;
                if (this.length === 0)
                {
                        x = new Exam(0, owner, title, description, taskset, group, final_deadline, review_deadline);
                }
                else
                {
                        x = new Exam(this[this.length - 1].id + 1, owner, title, description, taskset, group, final_deadline, review_deadline);
                }
                if (x !== null)
                {
                        this.push(x);
                }
                return this[this.length - 1];

        }
        //FILTER METHODS
        filterByOwner(owner) {
                return this.filter(obj => obj.owner.id === owner.id);
        }
        filterByTitle(title) {
                return this.filter(obj => obj.title === title);
        }
        //get all assingned exams by user id
        filterByAssingned(owner) {
            //check su ogni esame
            let arrayOfExam = this.filter(function (singleExam) {
                let exist = false;

                //se esame ha uno gruppo e tale gruppo non ���� vuoto
                if (singleExam.group !== undefined && singleExam.group.members !== undefined) {
                    for (let j = 0; j < singleExam.group.members.length; j++) {
                        //se utente attuale appartiene a gruppo di quella esame
                        if (singleExam.group.members[j].id === owner.id) {
                            exist = true;
                        }
                    }
                }
                return exist;
            });
            return arrayOfExam;
        }

        filterByAssignedId(assignedId) {
            let exams = [];
            let currentExam;
            let endInnerCycle = false;
            //Take an exam
            for (let i = 0; i < this.length; i++) {
                endInnerCycle = false;
                currentExam = this[i];
                //Cycle through all members of group to which exam was assigned
                for (let j = 0; j < currentExam.group.members.length && endInnerCycle === false; j++) {
                    if (currentExam.group.members[j].id === assignedId) {
                        exams.push(currentExam);
                        endInnerCycle = true;
                    }
                }
            }
            let retExams
            return retExams = JSON.parse(JSON.stringify(exams));
        }

        //GET METHODS
        getIndexById(id)
        {
                return this.indexOf(this.find(obj => obj.id === parseInt(id)));
        }
        getExamById(id)
        {
                return this.find(obj => obj.id === parseInt(id));
        }
        //DELETE METHODS
        deleteByTitleAndOwner(title, owner) {
                var index = this.indexOf(this.find(obj => (obj.title === title && obj.owner === owner)));
                if (index >= 0)
                {
                        this.splice(index, 1);
                }
        }
        deleteById(id) {
                var index = this.indexOf(this.find(obj => obj.id === parseInt(id)));
                if (index >= 0)
                {
                        this.splice(index, 1);
                }
        }
        //UPDATE METHODS
        updateGroup(group){
                for(let i = 0; i < this.length; i++){
                        if(this[i].group.id === group.id){
                                this[i].update("", "", "", group, "", "");
                        }
                }
        }
        updateUser(user){
                for(let i = 0; i < this.length; i++){
                        if(this[i].owner.id === user.id){
                                this[i].update("", "", "", "", "", "", user.email);
                        }
                }
        }
        updateTask(task){
                for(let i = 0; i < this.length; i++){
                        this[i].update("", "", "", "", "", "", "", task);
                }
        }
}

module.exports = Exams;