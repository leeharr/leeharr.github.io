'use strict';

var Person = function(pid, lname, fname, grade){
    let self = this;
    self.pid = ko.observable(pid);
    self.fname = ko.observable(fname);
    self.lname = ko.observable(lname);
    self.linitial = ko.observable(lname[0]);
    self.grade = ko.observable(grade);

    self.showperson = function(){
        console.log('SP');
        vm.shownewperson(true);
        if (vm.selectedgroup()){
            vm.selectedgroup().savecancel();
        }
        console.log(self.fname());
        console.log(self.lname());
        console.log(self.grade());
    }
}
