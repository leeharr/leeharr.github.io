'use strict';

var Group = function(gid, name){
    let self = this;
    self.gid = ko.observable(gid);
    self.name = ko.observable(name);
    self.active = ko.observable(true);
    self.people = ko.observableArray();
    self.activepeople = ko.pureComputed(function(){
        //console.log('PCAP '+self.name());
        let ppl = self.people();
        let appl = [];
        for (let p of ppl){
            //console.log('P '+p.fname()+' '+p.lname()+' '+p.active());
            if (p.active()){
                appl.push(p);
            }
        }
        return appl;
    });
    self.updategroup = ko.observable(false);

    self.addperson = function(p){
        self.people.push(p);
    }

    self.clsactive = ko.pureComputed(function(){
        if (self.active()){
            return '';
        } else {
            return 'inactive';
        }
    });

    self.showgroup = function(){
        // show the person checkboxes, and
        // set checked all people in the selected group
        //console.log('SG');
        vm.showpersoncheckboxes(true);
        vm.checkpersoncheckboxes(false);
        vm.selectedgroup(self);
        for (let p of self.people()){
//             if (!p.active()){ continue; }
            let ngpid = '#ngpid'+p.pid();
            //console.log('sg check :'+ngpid);
            let cb = document.querySelector(ngpid);
            cb.checked = true;
            if (!self.active()){
                cb.setAttribute('disabled', 'true');
            } else {
                cb.setAttribute('disabled', 'false');
            }
        }
    }

//     self.showupdategroup = function(p){
//         //console.log('SUG');
//         vm.showpersoncheckboxes(true);
//         vm.checkpersoncheckboxes(false);
//         self.updategroup(true);
//         vm.updategroup(true);
//     }

    self.savegroup = async function(){
        console.log('ASYNC SAVGRP');
        savegroup(self.gid());
    }

    self.savecancel = function(){
        // Do not save, restore group to previous members
        self.updategroup(false);
        vm.updategroup(false);
        vm.checkpersoncheckboxes(false);
        vm.showpersoncheckboxes(false);
        vm.selectedgroup(undefined);
        vm.shownewgroup(false);
    }

    self.newgroupsession = async function(){
        //console.log('NGS');
        vm.showgroupsession(true);
        self.checkgroupcheckboxes(true);

        let form = document.getElementById('newsession_questions');
        let fc = Array.from(form.children);
        for (let i=0; i<fc.length; i++){
            let div = fc[i];
            let qattr = div['data-qattr'];
            if (!qattr){ continue; }
            //console.log('qat '+qattr);
            //console.log('div '+div.id+' '+div);
            //console.log('divval '+div.value);
            let sel = div.children[1];
            let sel0 = div.children[0];
            //console.log('sel '+sel.id + ' ' + sel);
            //console.log('selval '+sel.value );
            //console.log('dr '+sel['data-reset']);

            let getremid = 'remember_'+qattr;
            let getrem = document.getElementById(getremid);
            //console.log('ggg '+getremid+' '+getrem+' '+div['data-remember']);
            if (getrem && getrem.checked || div['data-remember']===true){
                // restore remembered value
                //console.log('REM '+ div['data-remember']);
                //if (getrem){ console.log('checked: '+getrem.checked); }
                let val = await cget(qattr);
                //console.log('REMval '+val);
                if (sel.value instanceof Function){
                    //console.log('FUNC');
                    sel.setvalue(val);
                } else if (val){
                    sel.value = val;
                }

                let sa = session_answers[qattr];
                let othq = false;
                let otha = '';
                if (sa){
                    othq = checkforother(sa);
                    if (othq){
                        otha = othery(sa[val]);
                    } else {
                        otha = '';
                    }
                    if (othq && otha){
                        // question has an "Other" option, AND
                        // "Other" has been selected
                        sel.onchange(); // trigger to show other text field
                        let qattr_other = qattr + '_other';
                        let oval = await cget(qattr_other);
                        let subsel = div.children[2];
                        subsel.value = oval;
                    }
                }

            } else if (sel['data-reset']) {
                //console.log('SDR');
                sel['data-reset'](sel);
            } else {
                //console.log('NOA');
                sel.value = '';
            }

//             if (sel._yes){
//                 console.log('YNCO - reset');
//                 let pn = sel.parentNode;
//                 console.log(pn.classList);
//                 pn.classList.remove('qdiverr');
//             }

        }
    }

    self.checkgroupcheckboxes = function(check=true){
        let ppl = self.people();
        if (ppl.length == 0){ ppl = vm.people(); }
        for (let p of ppl){
            let ngpid = '#gspid'+p.pid();
            //console.log('cgcb ' + ngpid);
            let cb = document.querySelector(ngpid);
            if (cb && p.active()){
                //console.log('found');
                cb.checked = check;
            }
        }
    }
    self.checkuncheck = function(){
        // toggle (for check all / uncheck all)
        //console.log('grp cuc');

        if (!self.active()){ return; }

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
