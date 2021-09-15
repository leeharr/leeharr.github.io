'use strict';

var ProtoDBViewModel = function(){
    let self = this;
    self.people = ko.observableArray();
    self.groups = ko.observableArray();

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

    self.staffname = ko.observable('Test Name');
    self.position = ko.observable('Position Called');
    self.positionname = ko.computed(function(){
        let pos = self.position();
        let qp = document.getElementById('newstaff_questionsposition');
        let pstr = 'Filler';
        if (qp){
            pstr = qp.options[pos].text;
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

    self.flgsort = function (left, right) {
        /* sort by first name, then last name, then grade */
        let lln = left.lname();
        let lfn = left.fname();
        let rln = right.lname();
        let rfn = right.fname();
        let lgr = left.grade();
        let rgr = right.grade();

        if (lfn==rfn && lln==rfn){
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

    self.setinitials = function(){
        let fn = '';
        let ln = '';
        let li = '';
        let gr = '';
        let pi = '';
        let i = '';
        let prevp;

        for (let p of self.people_byflg()){
            console.log(p.fname()+' '+p.lname()+' '+p.grade());
        }

        for (let p of self.people_byflg()){
            p.linitial(p.lname().slice(0,1));
            console.log('X'+p.pid()+' '+fn+' '+ln+' '+li+' '+pi+' '+gr);
            if (prevp){
            console.log('_'+prevp.fname()+' '+prevp.lname()+' '+prevp.linitial()+' '+prevp.grade());
            }
            console.log('.'+p.fname()+' '+p.lname()+' '+p.linitial()+' '+p.grade());
            if (p.fname()==fn && p.lname()==ln && p.grade()==gr){
                console.log('C1');
                // exact same first, last, and grade
                // do something odd for very unusual case

                if (prevp && li.includes('*')){
                    i = prevp.linitial();
                } else if (prevp){
                    i = prevp.lname().slice(0,1);
                    i += '*';
                    prevp.linitial(i);
                }

                i += '*';
                p.linitial(i);
            } else if (p.fname()==fn && p.lname()==ln){
                console.log('C2');
                // same first and last, but different grade
                // show as fname l gr#
                if (prevp && li.includes('*')){
                    // do nothing to prev
                    i = p.lname().slice(0, 1);
                } else if (prevp && li.includes(' ')){
                    // graded. use prev initials and new grade
                    let idx = prevp.linitial().indexOf(' ');
                    i = prevp.linitial().slice(0, idx);
                    console.log('prevp space '+idx+' '+i)
                } else if (prevp){
                    i = prevp.lname().slice(0, 1);
                    let pvi = i + ' ' + prevp.grade();
                    prevp.linitial(pvi);
                } else {
                    i = p.lname().slice(0, 1);
                }
                i += ' ' + p.grade();
                p.linitial(i);
            } else if (p.fname()==fn && (p.linitial()==li||p.linitial()==pi)){
                console.log('C3');
                i = p.lname().slice(0, 2);
                p.linitial(i);
                if (prevp && !li.includes('*') && !li.includes(' ')){
                    i = prevp.lname().slice(0, 2);
                    prevp.linitial(i);
                }
                if (p.linitial() == prevp.linitial()){
                    if (p.grade() != gr){
                        p.linitial(p.linitial()+' '+p.grade());
                        prevp.linitial(prevp.linitial()+' '+gr);
                    }
                }

            } else {
                console.log('C4');
            }

            fn = p.fname();
            ln = p.lname();
            li = p.linitial();
            gr = p.grade();
            pi = p.lname().slice(0,1);
            prevp = p;
        }
    }

    self.rmperson = function(pid){
        let p = self.getperson(pid);
        if (p){
            console.log('rmvng');
            self.people.remove(p);
        }
    }
    self.addperson = function(pid, lname, fname, grade, seti){
        self.rmperson(pid);
        let p = new Person(pid, lname, fname, grade);
        self.people.push(p);
        if (seti){
            self.setinitials();
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
            console.log('cpcb ' + ngpid);
            let cb = document.querySelector(ngpid);
            if (cb){
                console.log('found.set.'+check);
                cb.checked = check;
            }
        }
    }
    self.checkuncheck = function(){
        if (self.showgroupsession()){
            console.log('selgrp');
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
    self.setchange = function(){
        console.log('SET CHANGE');
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
        console.log('gscanc '+g.name());
        if (g.name() == 'QUICK'){
            vm.groups.remove(g);
        }
    }

    self.dbsync = async function(){
        self.people.removeAll();
        let ks = await pkeys();
        for (let k of ks){
            if (k == 'currid'){ continue; }
            let p = await pget(k);
            if (ko.utils.arrayFirst(self.people(), function(i){
                return i.pid()==k})){console.log('ERROR.Person.Dup.Id.');}
                self.addperson(k, p.lname, p.fname, p.gradestr, false);
        }

        self.groups.removeAll();
        ks = await gkeys();
        for (let k of ks){
            if (k == 'currid'){ continue; }
            let g = await gget(k);
            if (ko.utils.arrayFirst(self.groups(), function(i){
                return i.gid()==k})){console.log('ERROR.Group.Dup.Id.');}
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
