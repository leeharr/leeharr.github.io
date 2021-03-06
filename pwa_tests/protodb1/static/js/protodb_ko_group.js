'use strict';

var Group = function(gid, name){
    let self = this;
    self.gid = ko.observable(gid);
    self.name = ko.observable(name);
    self.people = ko.observableArray();
    self.updategroup = ko.observable(false);

    self.addperson = function(p){
        self.people.push(p);
    }

    self.showgroup = function(){
        console.log('SG');
        vm.showpersoncheckboxes(true);
        vm.checkpersoncheckboxes(false);
        vm.selectedgroup(self);
        for (let p of self.people()){
            let ngpid = '#ngpid'+p.pid();
            console.log('sg check :'+ngpid);
            let cb = document.querySelector(ngpid);
            cb.checked = true;
        }
    }

    self.showupdategroup = function(p){
        console.log('SUG');
        vm.showpersoncheckboxes(true);
        vm.checkpersoncheckboxes(false);
        self.updategroup(true);
        vm.updategroup(true);
    }

    self.savegroup = async function(){
        savegroup(self.gid());
    }

    self.savecancel = function(){
        self.updategroup(false);
        vm.updategroup(false);
        vm.checkpersoncheckboxes(false);
        vm.showpersoncheckboxes(false);
        vm.selectedgroup(undefined);
    }

    self.newgroupsession = function(){
        console.log('NGS');
        vm.showgroupsession(true);
        self.checkgroupcheckboxes(true);
    }

    self.checkgroupcheckboxes = function(check=true){
        let ppl = self.people();
        if (ppl.length == 0){ ppl = vm.people(); }
        for (let p of ppl){
            let ngpid = '#gspid'+p.pid();
            console.log('cgcb ' + ngpid);
            let cb = document.querySelector(ngpid);
            if (cb){
                console.log('found');
                cb.checked = check;
            }
        }
    }
    self.checkuncheck = function(){
        console.log('grp cuc');
        let anychecked = false;
        let ppl = self.people();
        if (ppl.length == 0){ ppl = vm.people(); }
        for (let p of ppl){
            let ngpid = '#gspid'+p.pid();
            let cb = document.querySelector(ngpid);
            if (cb.checked){
                anychecked = true;
                break;
            }
        }

        if (anychecked){
            self.checkgroupcheckboxes(false);
        } else {
            self.checkgroupcheckboxes(true);
        }
    }
}
