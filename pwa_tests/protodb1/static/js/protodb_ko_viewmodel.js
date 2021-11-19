'use strict';

var ProtoDBViewModel = function(){
    let self = this;
    self.unsentdata = ko.observable(false);
    self.sheetsurl = ko.observable('');

    self.people = ko.observableArray();
    self.groups = ko.observableArray();
    self.activepeople = ko.pureComputed(function(){
        let ppl = self.people();
        let appl = [];
        for (let p of ppl){
            if (p.active()){
                appl.push(p);
            }
        }
        return appl;
    });
    self.any_inactive = ko.pureComputed(function(){
        let ppl = self.people();
        for (let p of ppl){
            if (!p.active()){
                return true;
            }
        }
        return false;
    });

    self.showeditstaff = ko.observable(false);
    self.shownewperson = ko.observable(false);
    self.personexists = ko.observable(false);
    self.shownewgroup = ko.observable(false);
    self.showpersoncheckboxes = ko.observable(false);
    self.updategroup = ko.observable(false);
    self.selectedgroup = ko.observable();
    self.selectedgroupname = ko.computed(function(){
        if (self.selectedgroup()){
            return self.selectedgroup().name();
        } else {
            return 'NO GROUP SELECTED';
        }
    }, self);
    self.showgroupsession = ko.observable(false);
    self.quickgroup = ko.observable(false);
    self.sendworking = ko.observable(false);

    self.staffname = ko.observable('Edit to set Name and Position!');
    self.position = ko.observable('Position Unset');
    self.positionname = ko.computed(function(){
        let pos = self.position();
        let qp = document.getElementById('newstaff_questionsposition');
        let pstr = 'Position Not Set';
        //console.log('PN');
        //console.log(pos);
        //console.log(qp);
        if (qp && pos){
            //console.log(qp.options);
            //pstr = qp.options[pos].text;
            pstr = selectoptiontext(qp, pos);
        }
        return pstr;
    });

    self.lfsort = function (left, right) {
        /* sort by last name, then first name */
        let lln = left.lname();
        let lfn = left.fname();
        let rln = right.lname();
        let rfn = right.fname();
        if (lln == rln){
            return (lfn < rfn) ? -1 : (lfn > rfn) ? 1 : 0;
        } else {
            return (lln < rln) ? -1 : 1;
        }
    }

    self.flsort = function (left, right) {
        /* sort by first name, then last name */
        let lln = left.lname();
        let lfn = left.fname();
        let rln = right.lname();
        let rfn = right.fname();
        if (lfn == rfn){
            return (lln < rln) ? -1 : (lln > rln) ? 1 : 0;
        } else {
            return (lfn < rfn) ? -1 : 1;
        }
    }

    self.aflsort = function (left, right) {
        /* sort by active/inactive, first name, then last name */
        let lac = left.active();
        let rac = right.active();
        let lln = left.lname();
        let lfn = left.fname();
        let rln = right.lname();
        let rfn = right.fname();
        if (lac && !rac){
            return -1;
        } else if (!lac && rac){
            return 1;
        } else if (lfn==rfn && lln==rln){
            return 0;
        } else if (lfn==rfn){
            return (lln < rln) ? -1 : (lln > rln) ? 1 : 0;
        } else {
            return (lfn < rfn) ? -1 : 1;
        }
    }

    self.flgsort = function (left, right) {
        /* sort by first name, then last name, then grade */
        let lln = left.lname();
        let lfn = left.fname();
        let rln = right.lname();
        let rfn = right.fname();
        let lgr = left.grade();
        let rgr = right.grade();

        if (lfn==rfn && lln==rln){
            return (lgr < rgr) ? -1 : (lgr > rgr) ? 1 : 0;
        } else if (lfn == rfn){
            return (lln < rln) ? -1 : (lln > rln) ? 1 : 0;
        } else {
            return (lfn < rfn) ? -1 : 1;
        }
    }

    self.people_bylf = ko.pureComputed(function(){
        return self.people.sorted(self.lfsort);
    });
    self.people_byfl = ko.pureComputed(function(){
        return self.people.sorted(self.flsort);
    });
    self.people_byafl = ko.pureComputed(function(){
        return self.people.sorted(self.aflsort);
    });
    self.people_a_byfl = ko.pureComputed(function(){
        let appl = self.people().filter(p => p.active());
        appl.sort(self.flsort);
        return appl;
    });
    self.people_i_byfl = ko.pureComputed(function(){
        let appl = self.people().filter(p => !p.active());
        appl.sort(self.flsort);
        return appl;
    });
    self.people_byflg = ko.pureComputed(function(){
        return self.people.sorted(self.flgsort);
    });

    self.group_people_bylf = ko.pureComputed(function(){
        if (self.selectedgroup()){
            if (self.selectedgroup().name()=='QUICK'){
                return self.people.sorted(self.lfsort);
            } else {
                return self.selectedgroup().people.sorted(self.lfsort);
            }
        } else {
            return [];
        }
    });
    self.group_people_byfl = ko.pureComputed(function(){
        if (self.selectedgroup()){
            if (self.selectedgroup().name()=='QUICK'){
                return self.people.sorted(self.flsort);
            } else {
                return self.selectedgroup().people.sorted(self.flsort);
            }
        } else {
            return [];
        }
    });
    self.group_apeople_byfl = ko.pureComputed(function(){
        //console.log('APBFL');
        let sg = self.selectedgroup();
        if (sg){
            let ppl;
            if (self.selectedgroup().name()=='QUICK'){
                //console.log('QK');
                ppl = self.activepeople();
            } else {
                //console.log('SG '+sg.name());
                ppl = sg.activepeople();
            }
            //console.log('1 '+ppl);
            ppl.sort(self.flsort);
            //console.log('2 '+ppl);
            return ppl;
        } else {
            return [];
        }
    });

    self.base_initials = function(){
        for (let p of self.people()){
            p.linitial(name_initials(p.lname()));
        }
    }

    self.setinitials2 = function(){
        //console.log('SI2');
        let iis = {}
        // organize ppl by fname+initials
        for (let p of self.people()){
            let fn = p.fname();
            let i = p.linitial();
            let ik = fn+'::'+i;
            //console.log(ik+' '+p.stid());
            if (iis[ik]){
                iis[ik].push(p);
            } else {
                iis[ik] = [p];
            }
        }

        let pinfos = {};
        for (let k in iis){
            let ps = iis[k];
            if (ps.length == 1){
                // if only 1 with that fname+initials, no need to deal with it
                continue;
            }
            //console.log('PI '+k);

            // gather more (hopefully differentiating) info about ppl
            for (let p of ps){
                    let fn = p.fname();
                    let i = p.linitial();
                    let ik = fn+'::'+i;
                    //console.log(ik+' '+p.stid());

                let pinfo = [];
                pinfo.p = p;
                let ln = p.lname();
                let g = graden(p.grade());
                let stid = p.stid();
                let stid3 = stid.slice(-3); // last 3 of student ID#
                //console.log('STID '+stid+' '+stid3);
                for (let grn of ['', g, stid3]){
                    for (let numi of [[1,1,1],
                                        [2,1,1],
                                        [1,2,1],
                                        [2,2,1],
                                        [2,2,2],
                                        [3,1,1],
                                        [3,2,1],
                                        [3,3,1],
                                        [3,3,2],
                                        [3,3,3]]){
                        let inits = name_initials(ln, numi);
                        if (grn){ inits += ' '+grn; }
                        pinfo.push(inits);
                    }
                }
                if (k in pinfos){
                    pinfos[k].push(pinfo)
                } else {
                    pinfos[k] = [pinfo];
                }
            }
        }
        for (let k in pinfos){
            //console.log('PO '+k)
            //console.log(pinfos[k]);
            let pinfo0 = pinfos[k][0];
            //console.log('pi0 '+pinfo0);
            let found = false;
            let fixed = [];
            for (let i=0; i<pinfo0.length; i++){
                // check the pinfos in order, find the first one
                // where all ppl are completely differentiated
                //console.log(i);
                let chkr = [];
                let ppl = [];
                for (let pi of pinfos[k]){
                    if (fixed.includes(pi.p)){continue;}
                    chkr.push(pi[i]);
                    ppl.push(pi.p);
                }
                //console.log('chkr '+chkr);
                if (alldiff(chkr)){
                    found = true;
                    for (let i in ppl){
                        let p = ppl[i];
                        p.linitial(chkr[i]);
                    }
                    break;
                } else {
                    let us = allunique(chkr);
                    for (let u of us){
                        //console.log('U '+u);
                        let ui = chkr.indexOf(u);
                        let p = ppl[ui];
                        p.linitial(u);
                        fixed.push(p);
                    }
                }
            }
            if (!found){
                //console.log('NOT FOUND '+k);
                let s = ' *';
                for (let pi of pinfos[k]){
                    let p = pi.p;
                    if (fixed.includes(p)){continue;}
                    p.linitial(p.linitial()+s);
                    s += '*';
                }
            }
        }
    }

    self.rmperson = function(pid){
        // removes (only) ko person object
        // used when modifying the person info
        let p = self.getperson(pid);
        if (p){
            //console.log('rmvng');
            self.people.remove(p);
        }
    }
    self.delete_person = async function(pid){
        // completely remove person from the system
        self.rmperson(pid);
        await pdel(pid);
        for (k of gkeys()){
            let g = await gget(k);
            let idx = g.people.indexOf(pid);
            if (idx > -1){
                g.people.splice(idx, 1);
                await gset(k, g);
            }
        }
    }
    self.addperson = function(pid, lname, fname, grade, seti){
        self.rmperson(pid);
        let p = new Person(pid, lname, fname, grade);
        self.people.push(p);
        if (seti){
            self.base_initials();
            self.setinitials2();
        } else {
            p.linitial(name_initials(p.lname()));
        }
        return p;
    }
    self.getperson = function(pid){
        //console.log('GP '+pid);
        let match = ko.utils.arrayFirst(self.people(), function(i){
            //console.log('  ck '+i.pid()+' '+pid);
            return i.pid()==pid;
        })
        //console.log('FOUND '+match);
        return match;
    }

    self.groups_byname = ko.pureComputed(function(){
        return self.groups.sorted(function(left, right){
            return (left.name() < right.name()) ? -1 : (left.name() > right.name()) ? 1 : 0;
        });
    });

    self.addgroup = function(gid, name){
        let g = new Group(gid, name);
        self.groups.push(g);
        return g;
    }
    self.getgroup = function(gid){
        let match = ko.utils.arrayFirst(self.groups(), function(i){
            return i.gid()==gid;
        })
        return match;
    }

    self.quick_group = function(){
        let gid = 0;
        let name = 'QUICK';
        self.quickgroup(true);
        return self.addgroup(gid, name);
    }

    self.enablepersoncheckboxes = function(enable=true){
        for (let p of self.people()){
            let ngpid = '#ngpid'+p.pid();
            let cb = document.querySelector(ngpid);
            cb.disabled = !enable;
        }
    }
    self.checkpersoncheckboxes = function(check=true){
        for (let p of self.people()){
            let ngpid = '#ngpid'+p.pid();
            //console.log('cpcb ' + ngpid);
            let cb = document.querySelector(ngpid);
            if (cb){
                //console.log('found.set.'+check);
                cb.checked = check;
            }
        }
    }
    self.checkuncheck = function(){
        if (self.showgroupsession()){
            //console.log('selgrp');
            return self.selectedgroup().checkuncheck();
        }

        let anychecked = false;
        for (let p of self.people()){
            let ngpid = '#ngpid'+p.pid();
            let cb = document.querySelector(ngpid);
            if (cb.checked){
                anychecked = true;
                break;
            }
        }

        if (anychecked){
            self.checkpersoncheckboxes(false);
        } else {
            self.checkpersoncheckboxes(true);
        }
    }

    self.checkgroupcheckboxes = function(check=true){
        for (let g of self.groups()){
            let npgid = '#npgid'+g.gid();
            //console.log('cgcb ' + npgid);
            let cb = document.querySelector(npgid);
            if (cb){
                //console.log('found.set.'+check);
                cb.checked = check;
            }
        }
    }
    self.grpcheckuncheck = function(){
        let anychecked = false;
        for (let g of self.groups()){
            let id = '#npgid'+g.gid();
            let cb = document.querySelector(id);
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
    self.setchange = function(){
        //console.log('SET CHANGE');
        if (vm.selectedgroup()){
            vm.selectedgroup().updategroup(true);
            vm.updategroup(true);
        }
        return true;
    }

    self.cancelgroupsession = function(){
        let g = vm.selectedgroup();
        self.showgroupsession(false);
        vm.checkpersoncheckboxes(false);
        vm.showpersoncheckboxes(false);
        vm.selectedgroup(undefined);
        vm.quickgroup(false);
        //console.log('gscanc '+g.name());
        if (g.name() == 'QUICK'){
            vm.groups.remove(g);
        }

        reset_session_questions();
    }

    self.dbsync = async function(){
        self.people.removeAll();
        let ks = await pkeys();
        for (let k of ks){
            if (k == 'currid'){ continue; }
            let p = await pget(k);
            if (ko.utils.arrayFirst(self.people(), function(i){return i.pid()==k})){
                console.log('ERROR.Person.Dup.Id.');
            }
            let vmp = self.addperson(k, p.lname, p.fname, p.gradestr, false);
            vmp.stid(p.stid);
            let active = p.active;
            if (active!==false){active=true;}
            vmp.active(active);
        }

        self.groups.removeAll();
        ks = await gkeys();
        for (let k of ks){
            if (k == 'currid'){ continue; }
            let g = await gget(k);
            if (ko.utils.arrayFirst(self.groups(), function(i){return i.gid()==k})){
                console.log('ERROR.Group.Dup.Id.');
            }
            let ng = self.addgroup(k, g.name);
            for (let pid of g.people){
                let p = vm.getperson(pid);
                ng.addperson(p);
            }
        }
    }
}
var vm = new ProtoDBViewModel()
ko.applyBindings(vm);
