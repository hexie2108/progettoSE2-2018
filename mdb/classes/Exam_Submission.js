const mdb = require('./../mdb');
class Exam_Submission{
    /*
    id(integer) PRIMARY KEY
    ref_exam(Exam) FOREIGN KEY
    submitter(User) FOREIGN KEY
    answer(string[])
    status(string)
    evaluation(string)
    */
    constructor(id, ref_exam, submitter, answer, status){
        this.id = id; this.ref_exam = ref_exam; this.submitter = submitter; this.answer = answer; 
        this.status = status; this.evaluation = "";
    }
    update(answer, status, evaluation, ref_exam, submitter_email){
        if(answer !== "" && answer !== undefined) this.answer = answer;
        if(status !== "" && status !== undefined) this.status = status; 
        if(evaluation !== "" && evaluation !== undefined) this.evaluation = evaluation;
        if(ref_exam !== "" && ref_exam !== undefined) this.ref_exam = ref_exam;
        if(submitter_email !== "" && submitter_email !== undefined) this.submitter.email = submitter_email;
        mdb.exam_peer_reviews.updateSubmission(this);
        return this;
    }
}
class Exam_Submissions extends Array{
    //ADD METHOD
    add(ref_exam, submitter, answer, status, evaluation){
        var x = null;
        if(this.length === 0){
            x = new Exam_Submission(0, ref_exam, submitter, answer, status, evaluation);
        }else{
            x = new Exam_Submission(this[this.length-1].id+1, ref_exam, submitter, answer, status, evaluation);
        }
        if(x !== null){
            this.push(x);
        }
        return this[this.length-1];
    }
    //FILTER METHODS
    filterByExam(exam){
        return this.filter(obj => obj.ref_exam.id === exam.id);
    }
    filterBySubmitter(submitter){
        return this.filter(obj => obj.submitter.email === submitter.email);
    }
    filterByExamOwner(owner){
        return this.filter(obj => obj.ref_exam.owner.email === owner.email);
    }
    filterBySubmitterId(id) {
        return this.filter(obj => obj.submitter.id === parseInt(id));
    }
    //GET METHODS
    getIndexById(id){
        return this.indexOf(this.find(obj => obj.id === parseInt(id)));
    }
    getExamSubmissionById(id){
        return this.find(obj => obj.id === parseInt(id));
    }
    //DELETE METHODS
    deleteById(id){
        var index = this.indexOf(this.find(obj => obj.id === parseInt(id)));
        if(index>=0){
            this.splice(index,1);
        }
    }
    hasSubmission(exam, user){//checks is there's already an exam_submission for the given exam and user
        var sub = this.find(obj => (obj.ref_exam.id === exam.id && obj.submitter.id === user.id));
        if(sub !== undefined){
            return true;
        }
        return false;
    }
    //UPDATE METHODS
    updateRef_Exam(exam){
        for(let i = 0; i < this.length; i++){
            if(this[i].ref_exam.id === exam.id){
                this[i].update("","","",exam);
            }
        }
    }
    updateUser(user){
        for(let i = 0; i < this.length; i++){
            if(this[i].submitter.id === user.id){
                this[i].update("", "", "", "", user.email);
            }
        }
    }
}
module.exports = Exam_Submissions;