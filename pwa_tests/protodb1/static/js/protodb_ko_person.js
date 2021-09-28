'use strict';

var Person = function(pid, lname, fname, grade){
    let self = this;
    self.pid = ko.observable(pid);
    self.fname = ko.observable(fname);
    self.lname = ko.observable(lname);
    self.linitial = ko.observable(lname[0]);
    self.grade = ko.observable(grade);

    self.checkorshowperson = async function(){
        //console.log('COSP');
        let idbase;
        let is_sess = vm.showgroupsession();
        if (is_sess){
            idbase = '#gspid';
        } else {
            idbase = '#ngpid';
        }

        if (vm.showpersoncheckboxes()){
            //console.log('boxes');
            let ngpid = idbase + self.pid();
            //console.log(ngpid);
            let cb = document.querySelector(ngpid);
            if (cb.checked){
                cb.checked = false;
            } else {
                cb.checked = true;
            }
            if (!is_sess){
                vm.setchange();
            }
        } else {
            //console.log('NOboxes');
            await self.showperson();
        }
    }

    self.showperson = async function(){
        vm.shownewperson(true);
        vm.personexists(true);
        if (vm.selectedgroup()){
            vm.selectedgroup().savecancel();
        }

        let dbp = await pget(self.pid());

        let formid = 'newperson_questions';
        let form = document.getElementById(formid);
        let fc = Array.from(form.children);
        for (let i=0; i<fc.length; i++){
            let div = fc[i];
            let qattr = div['data-qattr'];
            let elemid = formid + qattr;
            let elem = document.getElementById(elemid);
            let sa = session_answers[qattr];
            if (sa){
                elem.value = dbp[qattr+'id'];
            } else {
                elem.value = dbp[qattr+'str'];
            }
        }

//         let school = document.getElementById('newperson_questionsschool');
//         school.value = dbp.schoolid;
//
//         let fn = document.getElementById('newperson_questionsfname');
//         fn.value = dbp.fname;
//
//         let ln = document.getElementById('newperson_questionslname');
//         ln.value = dbp.lname;
//
//         let sid = document.getElementById('newperson_questionsstid');
//         sid.value = dbp.stid;
//
//         let gr = document.getElementById('newperson_questionsgrade');
//         gr.value = dbp.gradeid;
//
//         let dob = document.getElementById('newperson_questionsdob');
//         dob.value = dbp.dob;
//
//         let gen = document.getElementById('newperson_questionsgender');
//         gen.value = dbp.genderid;
//
//         let race = document.getElementById('newperson_questionsrace');
//         race.value = dbp.raceid;

        let xp = document.getElementById('xpersonid');
        xp.value = self.pid();
    }
}
