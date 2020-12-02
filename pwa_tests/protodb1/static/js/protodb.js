document.addEventListener('DOMContentLoaded', function(){

    var pid0 = '0';

    var getcurrid = async function(getter){
        val = await getter('currid');
        if (val){ return val; }
        else { return pid0; }
    }
    var getnextid = async function(getter, setter){
        s = await getter();
        currid = parseInt(s);
        currid += 1;
        setter('currid', currid.toString());
        return currid.toString();
    }

    pdbppl = new idbKeyval.Store(storeName='protodb-people');
    var pset = function(key, value){ return idbKeyval.set(key, value, pdbppl);}
    var pget = function(key){ return idbKeyval.get(key, pdbppl);}
    var pkeys = function(){ return idbKeyval.keys(pdbppl);}
    var pgetcurrid = async function(){ return getcurrid(pget); }
    var pgetnextid = async function(){ return getnextid(pgetcurrid, pset); }

    pdbgrp = new idbKeyval.Store(storeName='protodb-groups');
    var gset = function(key, value){ return idbKeyval.set(key, value, pdbgrp);}
    var gget = function(key){ return idbKeyval.get(key, pdbgrp);}
    var gkeys = function(){ return idbKeyval.keys(pdbgrp);}
    var ggetcurrid = async function(){ return getcurrid(gget); }
    var ggetnextid = async function(){ return getnextid(ggetcurrid, gset); }

    pdbses = new idbKeyval.Store(storeName='protodb-sessions');
    var sset = function(key, value){ return idbKeyval.set(key, value, pdbses);}
    var sget = function(key){ return idbKeyval.get(key, pdbses);}
    var skeys = function(){ return idbKeyval.keys(pdbses);}
    var sgetcurrid = async function(){ return getcurrid(sget); }
    var sgetnextid = async function(){ return getnextid(sgetcurrid, sset); }

    pdbcfg = new idbKeyval.Store(storeName='protodb-config');
    var cset = function(key, value){ return idbKeyval.set(key, value, pdbcfg);}
    var cget = function(key){ return idbKeyval.get(key, pdbcfg);}
    var ckeys = function(){ return idbKeyval.keys(pdbcfg);}
    var cgetcurrid = async function(){ return getcurrid(cget); }
    var cgetnextid = async function(){ return getnextid(cgetcurrid, cset); }

    var Person = function(pid, lname, fname, grade){
        var self = this;
        self.pid = ko.observable(pid);
        self.fname = ko.observable(fname);
        self.lname = ko.observable(lname);
        self.grade = ko.observable(grade);
    }
    var Group = function(gid, name){
        var self = this;
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
            for (p of self.people()){
                ngpid = '#ngpid'+p.pid();
                console.log('sg check :'+ngpid);
                cb = document.querySelector(ngpid);
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
            for (p of self.people()){
                ngpid = '#gspid'+p.pid();
                console.log('cgcb ' + ngpid);
                cb = document.querySelector(ngpid);
                if (cb){
                    console.log('found');
                    cb.checked = check;
                }
            }
        }
        self.checkuncheck = function(){
            var anychecked = false;
            for (p of self.people()){
                ngpid = '#gspid'+p.pid();
                cb = document.querySelector(ngpid);
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
    var ProtoDBViewModel = function(){
        var self = this;
        self.people = ko.observableArray();
        self.groups = ko.observableArray();

        self.shownewperson = ko.observable(false);
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

        self.pplsort = function (left, right) {
            var lln = left.lname();
            var lfn = left.fname();
            var rln = right.lname();
            var rfn = right.fname();
            if (lln == rln){
                return (lfn < rfn) ? -1 : (lfn > rfn) ? 1 : 0;
            } else {
                return (lln < rln) ? -1 : 1;
            }
        }

        self.people_bylf = ko.pureComputed(function(){
            return self.people.sorted(self.pplsort);
        });

        self.group_people_bylf = ko.pureComputed(function(){
            if (self.selectedgroup()){
                return self.selectedgroup().people.sorted(self.pplsort);
            } else {
                return [];
            }
        });

        self.addperson = function(pid, lname, fname, grade){
            var p = new Person(pid, lname, fname, grade);
            self.people.push(p);
            return p;
        }
        self.getperson = function(pid){
            console.log('GP '+pid);
            var match = ko.utils.arrayFirst(self.people(), function(i){
                console.log('  ck '+i.pid()+' '+pid);
                return i.pid()==pid;
            })
            return match;
        }

        self.groups_byname = ko.pureComputed(function(){
            return self.groups.sorted(function(left, right){
                return (left.name() < right.name()) ? -1 : (left.name() > right.name()) ? 1 : 0;
            });
        });

        self.addgroup = function(gid, name){
            var g = new Group(gid, name);
            self.groups.push(g);
            return g;
        }
        self.getgroup = function(gid){
            var match = ko.utils.arrayFirst(self.groups(), function(i){
                return i.gid()==gid;
            })
            return match;
        }

        self.enablepersoncheckboxes = function(enable=true){
            for (p of self.people()){
                ngpid = '#ngpid'+p.pid();
                cb = document.querySelector(ngpid);
                cb.disabled = !enable;
            }
        }
        self.checkpersoncheckboxes = function(check=true){
            for (p of self.people()){
                ngpid = '#ngpid'+p.pid();
                console.log('cpcb ' + ngpid);
                cb = document.querySelector(ngpid);
                if (cb){
                    console.log('found.set.'+check);
                    cb.checked = check;
                }
            }
        }
        self.checkuncheck = function(){
            if (self.showgroupsession()){
                return self.selectedgroup().checkuncheck();
            }

            var anychecked = false;
            for (p of self.people()){
                ngpid = '#ngpid'+p.pid();
                cb = document.querySelector(ngpid);
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
            self.showgroupsession(false);
            vm.checkpersoncheckboxes(false);
            vm.showpersoncheckboxes(false);
            vm.selectedgroup(undefined);
        }

        self.dbsync = async function(){
            self.people.removeAll();
            ks = await pkeys();
            for (k of ks){
                if (k == 'currid'){ continue; }
                p = await pget(k);
                if (ko.utils.arrayFirst(self.people(), function(i){
                            return i.pid()==k})){console.log('ERROR.Person.Dup.Id.');}
                self.addperson(k, p.lname, p.fname, p.gradestr);
            }

            self.groups.removeAll();
            ks = await gkeys();
            for (k of ks){
                if (k == 'currid'){ continue; }
                g = await gget(k);
                if (ko.utils.arrayFirst(self.groups(), function(i){
                            return i.gid()==k})){console.log('ERROR.Group.Dup.Id.');}
                ng = self.addgroup(k, g.name);
                for (pid of g.people){
                    p = vm.getperson(pid);
                    ng.addperson(p);
                }
            }
        }
    }
    var vm = new ProtoDBViewModel()
    ko.applyBindings(vm);


    shownewperson = function(){
        vm.shownewperson(!vm.shownewperson());
//         fname = document.querySelector('#fname');
//         fname.value = '';
//         lname = document.querySelector('#lname');
//         lname.value = '';
    }
    newperson = async function(e){
        console.log('new person form sent');
//         fname = document.querySelector('#fname');
//         lname = document.querySelector('#lname');
//         var p = {'lname': lname.value, 'fname': fname.value};
//         var i = await pgetnextid();
//         console.log(i + ' - - ' + p.lname + ', ' + p.fname);
//         pset(i, p);

//         vm.addperson(i, lname.value, fname.value);
//
//         fname.value = '';
//         lname.value = '';
        vm.shownewperson(false);

        var p = {}

        form = document.getElementById('newpersontbl');
        Array.from(form.children).forEach(function(tr, i, arr){
            qattr = tr['data-qattr'];
            if (!qattr){ return; }

            console.log('qattr : '+qattr);
            tda = tr.children[1];
            sel = tda.children[0];
            console.log('   val : '+sel.value);
            p[qattr+'id'] = sel.value;
            if (person_answers[qattr]){
                console.log('     a : '+person_answers[qattr][sel.value]);
                p[qattr+'str'] = person_answers[qattr][sel.value];
                sel.value = ''
            } else {
                p[qattr] = sel.value;
                p[qattr+'str'] = sel.value;
                sel['data-reset'](sel);
            }
        });

        var i = await pgetnextid();
        console.log(i + ' - - ' + p.lname + ', ' + p.fname);
        pset(i, p);
        vm.addperson(i, p.lname, p.fname, p.gradestr);

        vm.shownewperson(false);
    }

    shownewgroup = function(){
        gname = document.querySelector('#gname');
        gname.value = '';
        if (!vm.shownewgroup()){
            vm.shownewgroup(true);
            vm.showpersoncheckboxes(true);
            vm.selectedgroup(undefined);
            vm.checkpersoncheckboxes(false);
        } else {
            vm.shownewgroup(false);
            vm.showpersoncheckboxes(false);
            vm.selectedgroup(undefined);
            vm.checkpersoncheckboxes(false);
        }
    }
    newgroup = async function(e){
        console.log('new group form sent');
        gname = document.querySelector('#gname');
        var g = {'name': gname.value, 'people': []}
        var i = await ggetnextid();
        console.log(i + ' .... ' + g.name);

        ng = vm.addgroup(i, gname.value);

        ks = await pkeys();
        for (k of ks){
            if (k == 'currid') { continue; }
            ngpid = '#ngpid' + k;
            cb = document.querySelector(ngpid);
            if (cb.checked){
                console.log(ngpid + ' checked');
                g.people.push(k);
                p = vm.getperson(k);
                if (p){ ng.addperson(p); }
            }
        }

        gset(i, g);

        gname.value = '';
//         vm.checkpersoncheckboxes(false);
        vm.shownewgroup(false);
        vm.selectedgroup(ng);
    }
    savegroup = async function(gid){
        g = await gget(gid);
        g.people = [];
        vmg = vm.getgroup(gid);
        vmg.people.removeAll();
        ks = await pkeys();
        for (k of ks){
            if (k == 'currid') { continue; }
            ngpid = '#ngpid' + k;
            cb = document.querySelector(ngpid);
            if (cb.checked){
                console.log(ngpid + ' checked');
                g.people.push(k);
                p = vm.getperson(k);
                if (p){ vmg.addperson(p); }
            }
        }
        gset(gid, g);

        vmg.updategroup(false);
        vm.updategroup(false);
    }

    logdb = async function(e){
        console.log('PEOPLE');
        ks = await pkeys();
        for (k of ks){
            v = await pget(k);
            if (k == 'currid'){
                console.log('CURRID: ' + v);
            } else {
            console.log(k + ': ' + v.lname + ', ' + v.fname);
            }
        }

        console.log('GROUPS');
        ks = await gkeys();
        for (k of ks){
            v = await gget(k);
            if (k == 'currid'){
                console.log('CURRID: ' + v);
            } else {
                console.log(k + ': ' + v.name);
                for (i of v.people){
                    console.log('.... ' + i);
                }
            }
        }

        console.log('SESSIONS');
        ks = await skeys();
        for (k of ks){
            v = await sget(k);
            if (k == 'currid'){
                console.log('CURRID: ' + v);
            } else {
                console.log(k + ': ' + v.sesname);
                console.log('  ::' + v.datestr);
                console.log('  ::' + v.lname + ', ' + v.fname);
            }
        }
    }

    clearppl = function(e){
        idbKeyval.clear(pdbses);

        idbKeyval.clear(pdbgrp);
        vm.groups.removeAll();

        idbKeyval.clear(pdbppl);
        vm.people.removeAll();
    }


    dltest = async function() {
        dt = new Date();
        m = dt.getMonth()+1;
        d = dt.getDate();
        y = dt.getFullYear();
        filename = `protodb-${y}-${m}-${d}.json`;

        dbppl = [];
        for (k of await pkeys()){
            if (k=='currid'){ continue; }
            p = await pget(k);
            p['id'] = k;
            dbppl.push(p);
        }

        dbgrp = []
        for (k of await gkeys()){
            if (k=='currid'){ continue; }
            g = await gget(k);
            g['id'] = k;
            dbgrp.push(g);
        }

        dbses = []
        for (k of await skeys()){
            if (k=='currid'){ continue; }
            s = await sget(k);
            s['id'] = k;
            dbses.push(s);
        }

        db = {'people': dbppl, 'groups': dbgrp, 'sessions': dbses}

        data = JSON.stringify(db);
        var blob = new Blob([data], {type: 'text/json'});
        if(window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, filename);
        } else {
            var elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = filename;
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);
        }
    }

    ultest = function() {
        var input, file, fr;

        if (typeof window.FileReader !== 'function') {
            alert("The file API isn't supported on this browser yet.");
            return;
        }

        input = document.getElementById('fileinput');
        if (!input) {
            alert("Um, couldn't find the fileinput element.");
        } else if (!input.files) {
            alert("This browser doesn't seem to support the `files` property of file inputs.");
        } else if (!input.files[0]) {
            alert("Please select a file before clicking 'Load'");
        } else {
            file = input.files[0];
            fr = new FileReader();
            fr.onload = receivedText;
            fr.readAsText(file);
        }

        function receivedText(e) {
            let lines = e.target.result;
            var db = JSON.parse(lines);

            pidmax = 0;
            for (k in db.people){
                p = db.people[k];
                pidmax = Math.max(pidmax, p.id);
                console.log(p.id + ' --> ' + p.lname + ', ' + p.fname);
            }
            setpid = parseInt(pidmax) + 1
            console.log('SET PID to ' + setpid);

            gidmax = 0;
            for (k in db.groups){
                g = db.groups[k];
                gidmax = Math.max(gidmax, g.id);
                console.log(g.id + ' --> ' + g.name + ':' + g.people);
            }
            setgid = parseInt(gidmax) + 1
            console.log('SET GID to ' + setgid);

            input = document.getElementById('fileinput');
            input.value = '';
        }
    }

    var textinput = function(div, req){
        console.log('ADD TEXT INPUT');
        ti = document.createElement('input');
        ti.type = 'text';
        if (req){
            ti.required = true;
        }
        div.appendChild(ti);
        return ti;
    }
    var textinputreset = function(ti){
        ti.value = '';
    }

    person_questions = [
        {'q': 'First Name',
            'qattr': 'fname',
            'req': true,
            'af': textinput,
            'areset': textinputreset},

        {'q': 'Last Initial',
            'qattr': 'lname',
            'req': true,
            'af': textinput,
            'areset': textinputreset},

        {'q': 'Grade',
            'qattr': 'grade',
            'req': true,
            'a': ["Pre-K",
                    "Kinder",
                    "1st",
                    "2nd",
                    "3rd",
                    "4th",
                    "5th",
                    "6th",
                    "7th",
                    "8th",
                    "Freshman",
                    "Sophomore",
                    "Junior",
                    "Senior"]}]
    person_answers = {}

    var load_person_questions = function(){
        form = document.getElementById('newpersontbl');
        if (!form){ return; }
        subb = form.children[0];
        form.removeChild(subb);

        person_questions.forEach(function(qa, qi, qarr){
            tr = document.createElement('tr');
            tr['data-qattr'] = qa.qattr;
            form.appendChild(tr);
            tdq = document.createElement('td');
            tdq.innerHTML = qa.q;
            if (qa.req){
                tdq.innerHTML += ' (REQUIRED)';
            }
            tr.appendChild(tdq);

            tda = document.createElement('td');
            tr.appendChild(tda);

            if (qa.a){
                sel = document.createElement('select');
                if (qa.req){
                    sel.required = true;
                }
                tda.appendChild(sel);

                person_answers[qa.qattr] = qa.a;

                op = document.createElement('option');
                op.innerHTML = 'Choose...';
                op.value = '';
                sel.appendChild(op);

                qa.a.forEach(function(a, ai, aarr){
                    op = document.createElement('option');
                    op.innerHTML = a;
                    op.value = ai.toString();
                    sel.appendChild(op);
                });
            } else {
                e = qa.af(tda, qa.req);
                e['data-reset'] = qa.areset;
                qa.areset(e);
            }
        });
        form.appendChild(subb);
    }
    load_person_questions();


    createsession = async function(){
        console.log('CREATE SESSION');
        vm.showgroupsession(false);

        g = vm.selectedgroup();
        dt = new Date();
        sesname = `${g.name()}-${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}-${dt.getTime()}`

        sesdata = {'sesname': sesname}

        form = document.getElementById('newsession_questions');
        Array.from(form.children).forEach(function(div, i, arr){
            qattr = div['data-qattr'];
            console.log('qattr : '+qattr);
            sel = div.children[1];
            val = sel.value;
            console.log('   val : '+val);
            sesdata[qattr+'id'] = val;
            if (session_answers[qattr]){
                console.log('     a : '+session_answers[qattr][val]);
                sesdata[qattr+'str'] = session_answers[qattr][val];
                sel.value = ''
            } else {
                sesdata[qattr+'str'] = val;
                sel['data-reset'](sel);
            }

            if (div['data-remember']){
                cset(qattr, val);
                sel.value = val;
            }
        });

        for (p of g.people()){
            pid = p.pid();

            gspid = '#gspid'+pid;
            cb = document.querySelector(gspid);
            if (cb && !cb.checked){
                console.log('NOT SEL: '+pid);
                continue;
            }

            psesdata = Object.assign({}, sesdata);
            psesdata['pid'] = pid;
            psesdata['lname'] = p.lname();
            psesdata['fname'] = p.fname();
            psesdata['grade'] = p.grade();
            sid = await sgetnextid();
            await sset(sid, psesdata);
        }

        vm.showgroupsession(false);
        vm.showpersoncheckboxes(true);
        vm.selectedgroup(undefined);
        vm.checkpersoncheckboxes(false);
    }

    var dateselector = function(div, req){
        console.log('ADD DATE SELECTOR');
        dsel = document.createElement('input');
        dsel.type = 'date';
        if (req){
            dsel.required = true;
        }
        div.appendChild(dsel);
        return dsel;
    }
    var datereset = function(dsel){
        dt = new Date();
        m = dt.getMonth()+1;
        if (m<10){ m = '0'+m;}
        d = dt.getDate();
        if (d<10){ d = '0'+d;}
        y = dt.getFullYear();
        dtstr = `${y}-${m}-${d}`;
        console.log('DATE RESET to '+dtstr);
        dsel.value = dtstr;
    }

    session_questions = [
        {'q': 'School',
            'qattr': 'school',
            'req': true,
            'remember': true,
            'a': ["2", "3", "4", "5", "8"]},

        {'q': "Referral Source (who sent the student)",
            'qattr': 'refsource',
            'req': true,
            'a': ["Admin assigned",
                    "Self (student)",
                    "Sent out of class (behavior)",
                    "Sent out of class by teacher for support (non behavior related)",
                    "SSO",
                    "In class support (you went to the class)",
                    "Work from home check in (only during stay at home orders)"]},

        {'q': "Location student came to you from",
            'qattr': 'location',
            'req': true,
            'a': ["Classroom",
                    "Cafeteria",
                    "Hallways",
                    "Specials",
                    "Recess",
                    "Issue on bus",
                    "Virtual Help Zone",
                    "Blessed Sacrament (EAST HIGH ONLY)"]},

        {'q': "Date",
            'qattr': 'date',
            'req': true,
            'af': dateselector,
            'areset': datereset,
        },
    ]
    session_answers = {}

    async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    var load_session_questions = async function(){
        form = document.getElementById('newsession_questions');
        if (!form){ return; }

        asyncForEach(session_questions, async function(qa, qi, qarr){
            div = document.createElement('div');
            div['data-qattr'] = qa.qattr;
            div['data-remember'] = qa.remember;
            form.appendChild(div);
            qspan = document.createElement('div');
            qspan.innerHTML = qa.q;
            div.appendChild(qspan);

            if (qa.a){
                sel = document.createElement('select');
                if (qa.req){
                    sel.required = true;
                    qspan.innerHTML += ' (REQUIRED)';
                }
                div.appendChild(sel);

                session_answers[qa.qattr] = qa.a;

                op = document.createElement('option');
                op.innerHTML = 'Choose...';
                op.value = '';
                sel.appendChild(op);

                qa.a.forEach(function(a, ai, aarr){
                    op = document.createElement('option');
                    op.innerHTML = a;
                    op.value = ai.toString();
                    sel.appendChild(op);
                });
            } else {
                e = qa.af(div, qa.req);
                e['data-reset'] = qa.areset;
                qa.areset(e);
            }

            if (qa.remember){
                val = await cget(qa.qattr);
                console.log('REMEMBER ' + qa.qattr + ' ' + val);
                sel.value = val;
            }
        });
    }
    load_session_questions();

    var loadppl = async function(e){
        await vm.dbsync();
    }
    loadppl();

    showsamplesheet = async function(e){
        cols = ['lname', 'fname', 'grade', 'datestr',
                    'refsourcestr', 'locationstr', 'sesname']
        tbl = document.getElementById('samplesheet');
        thead = document.createElement('thead');
        tbl.appendChild(thead);
        tr = document.createElement('tr');
        thead.appendChild(tr);
        for (col of cols){
            th = document.createElement('th');
            th.innerHTML = col;
            tr.appendChild(th);
        }

        tbody = document.createElement('tbody');
        tbl.appendChild(tbody);
        for (k of await skeys()){
            if (k == 'currid'){ continue; }
            tr = document.createElement('tr');
            tbody.appendChild(tr);
            s = await sget(k);
            for (col of cols){
                td = document.createElement('td');
                td.innerHTML = s[col];
                tr.appendChild(td);
            }
        }
    }
});
