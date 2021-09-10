'use strict';

var Person = function(pid, lname, fname, grade){
    let self = this;
    self.pid = ko.observable(pid);
    self.fname = ko.observable(fname);
    self.lname = ko.observable(lname);
    self.linitial = ko.observable(lname[0]);
    self.grade = ko.observable(grade);

    self.showperson = async function(){
        console.log('SP');
        vm.shownewperson(true);
        vm.personexists(true);
        if (vm.selectedgroup()){
            vm.selectedgroup().savecancel();
        }

        console.log(self.pid());
        let dbp = await pget(self.pid());

        let school = document.getElementById('newperson_questionsschool');
        console.log(dbp.schoolid);
        school.value = dbp.schoolid;

        console.log(self.fname());
        console.log(dbp.fname);
        let fn = document.getElementById('newperson_questionsfname');
        fn.value = dbp.fname;

        console.log(self.lname());
        let ln = document.getElementById('newperson_questionslname');
        ln.value = dbp.lname;

        console.log(self.grade());
        let gr = document.getElementById('newperson_questionsgrade');
        gr.value = dbp.gradeid;
    }
}
