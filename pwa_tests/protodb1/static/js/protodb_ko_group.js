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
        //console.log('SG');
        vm.showpersoncheckboxes(true);
        vm.checkpersoncheckboxes(false);
        vm.selectedgroup(self);
        for (let p of self.people()){
            let ngpid = '#ngpid'+p.pid();
            //console.log('sg check :'+ngpid);
            let cb = document.querySelector(ngpid);
            cb.checked = true;
        }
    }

    self.showupdategroup = function(p){
        //console.log('SUG');
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

    self.newgroupsession = async function(){
        console.log('NGS');
        vm.showgroupsession(true);
        self.checkgroupcheckboxes(true);

        let form = document.getElementById('newsession_questions');
        let fc = Array.from(form.children);
        for (let i=0; i<fc.length; i++){
            let div = fc[i];
            let qattr = div['data-qattr'];
            if (!qattr){ continue; }
            console.log('qat '+qattr);
            console.log('div '+div.id+' '+div);
            console.log('divval '+div.value);
            let sel = div.children[1];
            let sel0 = div.children[0];
            console.log('sel '+sel.id + ' ' + sel);
            console.log('sel0 '+sel0.id + ' ' + sel0);
            console.log('dr '+sel['data-reset']);

            let getremid = 'remember_'+qattr;
            let getrem = document.getElementById(getremid);
            console.log('ggg '+getremid+' '+getrem+' '+div['data-remember']);
            if (getrem && getrem.checked || div['data-remember']===true){
                console.log('REM '+ div['data-remember']);
                if (getrem){
                    console.log(getrem.checked);
                }
                let val = await cget(qattr);
                console.log('REMval '+val);
//                 if (sel0.value instanceof Function){
//                     console.log('FUNC');
//                 } else if (val){
//                     sel.value = val;
//                 }
            } else if (sel['data-reset']) {
                console.log('SDR');
                sel['data-reset'](sel);
            } else {
                console.log('NOA');
                sel.value = '';
            }
        }
    }

    self.checkgroupcheckboxes = function(check=true){
        let ppl = self.people();
        if (ppl.length == 0){ ppl = vm.people(); }
        for (let p of ppl){
            let ngpid = '#gspid'+p.pid();
            //console.log('cgcb ' + ngpid);
            let cb = document.querySelector(ngpid);
            if (cb){
                //console.log('found');
                cb.checked = check;
            }
        }
    }
    self.checkuncheck = function(){
        //console.log('grp cuc');
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
