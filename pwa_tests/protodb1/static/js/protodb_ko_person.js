'use strict';

var Person = function(pid, lname, fname, grade){
    let self = this;
    self.pid = ko.observable(pid);
    self.fname = ko.observable(fname);
    self.lname = ko.observable(lname);
    self.linitial = ko.observable(lname[0]);
    self.grade = ko.observable(grade);

    self.checkorshowperson = async function(){
        console.log('COSP');
        let idbase;
        if (vm.showgroupsession()){
            idbase = '#gspid';
        } else {
            idbase = '#ngpid';
        }

        if (vm.showpersoncheckboxes()){
            console.log('boxes');
            let ngpid = idbase + self.pid();
            console.log(ngpid);
            let cb = document.querySelector(ngpid);
            if (cb.checked){
                cb.checked = false;
            } else {
                cb.checked = true;
            }
            vm.setchange();
        } else {
            console.log('NOboxes');
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

        let school = document.getElementById('newperson_questionsschool');
        school.value = dbp.schoolid;

        let fn = document.getElementById('newperson_questionsfname');
        fn.value = dbp.fname;

        let ln = document.getElementById('newperson_questionslname');
        ln.value = dbp.lname;

        let gr = document.getElementById('newperson_questionsgrade');
        gr.value = dbp.gradeid;

        let dob = document.getElementById('newperson_questionsdob');
        dob.value = dbp.dob;

        let xp = document.getElementById('xpersonid');
        xp.value = self.pid();
    }
}
