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
        self.sendworking = ko.observable(false);

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
    }
    newperson = async function(e){
        console.log('new person form sent');
        vm.shownewperson(false);

        var p = {}

        var form = document.getElementById('newperson_questions');
        Array.from(form.children).forEach(function(div, i, arr){
            qattr = div['data-qattr'];
            if (!qattr){ return; }

            console.log('qattr : '+qattr);
            sel = div.children[1];
            val = sel.value;
            console.log('   val : '+val);
            p[qattr+'id'] = val;
            if (person_answers[qattr]){
                console.log('     a : '+person_answers[qattr][val]);
                p[qattr+'str'] = person_answers[qattr][val];
                sel.value = ''
            } else {
                p[qattr] = val;
                p[qattr+'str'] = val;
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

    function _age(dobstr) {
        if (!dobstr){ return 0; }
        var dob = new Date(dobstr);
        var ageDifMs = Date.now() - dob.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    createsession = async function(){
        console.log('CREATE SESSION');
        vm.showgroupsession(false);

        vm.sendworking(true);
        working = [];

        window.onbeforeunload = function(){
            return "WAIT!";
        }

        g = vm.selectedgroup();
        dt = new Date();
        sesname = `${g.name()}-${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}-${dt.getTime()}`

        sesdata = {'sesname': sesname}

        var form = document.getElementById('newsession_questions');
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

            dbp = await pget(pid);

            psesdata['lname'] = dbp.lname;
            psesdata['fname'] = dbp.fname;
            psesdata['grade'] = dbp.gradestr;
            psesdata['age'] = _age(dbp.dob).toString();

            sid = await sgetnextid();
            await sset(sid, psesdata);

            working.push(sid);
        }

        vm.showgroupsession(false);
        vm.showpersoncheckboxes(false);
        vm.selectedgroup(undefined);
        vm.checkpersoncheckboxes(false);

        setTimeout(sendalltosheet, 2000);
        setTimeout(checkdone, 200);
    }

    checkdone = function(){
        if (working.length != 0){
            setTimeout(checkdone, 200);
        } else {
            vm.sendworking(false);
            window.onbeforeunload = null;
        }
    }

    function urlencode (str) {
        return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
        .replace(/%20/g, '+');
    }
    function addnv(name, value) {
        return urlencode(name) + '=' + urlencode(value);
    }
    hts = function(o){
        ss = [];
        for (k of Object.keys(o)){
            s = addnv(k, o[k]);
            ss.push(s);
        }
        return ss.join('&');
    }
    sheetsurl = 'https://script.google.com/macros/s/AKfycbyZ-qmvpF2iu8Gn4js_3HaiM36l537DEZPhk7BzYjC1TjMWcHg/exec'
    sendonetosheet = async function(o){
        var d = hts(o);
        fetch(sheetsurl+'?'+d)
        .then(function(response){ console.log('responded'); working.pop(); })
        .catch(function(error){ console.log('err ' + error); })
    }
    sendalltosheet = async function(){
        sentthrough = await cget('datasent');
        sentthrough = parseInt(sentthrough);
        console.log('sending from ' + sentthrough);

        for (k of await skeys()){
            if (k=='currid'){ continue; }

            sid = parseInt(k);
            if (sid <= sentthrough){ continue; }

            s = await sget(k);
            s['id'] = k;
            sendonetosheet(s);
        }
        scurid = await sgetcurrid();
        cset('datasent', scurid);
        console.log('... to ' + scurid);
    }

    dateselector = function(div, req){
        console.log('ADD DATE SELECTOR');
        dsel = document.createElement('input');
        dsel.type = 'date';
        if (req){
            dsel.required = true;
        }
        div.appendChild(dsel);
        return dsel;
    }
    datereset = function(dsel){
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
    dateclear = function(dsel){
        dsel.value = '';
    }

    textinput = function(div, req){
        console.log('ADD TEXT INPUT');
        ti = document.createElement('input');
        ti.type = 'text';
        if (req){
            ti.required = true;
        }
        div.appendChild(ti);
        return ti;
    }
    textinputreset = function(ti){
        ti.value = '';
    }

    var load_questions = async function(formid, questions, answers){
        var form = document.getElementById(formid);
        if (!form){ return; }

        questions.forEach(function(qa, qi, qarr){
            div = document.createElement('div');
            div.setAttribute('class', 'qdiv');
            div['data-qattr'] = qa.qattr;
            div['data-remember'] = qa.remember;
            console.log('APPEND TO '+form+ ' ID '+ form.id);
            form.appendChild(div);
            qspan = document.createElement('div');
            qspan.innerHTML = qa.q;
            div.appendChild(qspan);

            if (qa.a){
                sel = document.createElement('select');
                div.appendChild(sel);

                answers[qa.qattr] = qa.a;

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
                console.log('look for ' + qa.af);
                af = window[qa.af];
                sel = af(div, qa.req);
                areset = window[qa.areset];
                sel['data-reset'] = areset;
                areset(sel);
            }

            if (qa.req){
                sel.required = true;
                qreq = document.createElement('span');
                qreq.innerHTML = '*';
                qreq.setAttribute('class', 'qreq');
                qspan.appendChild(qreq);
                div.setAttribute('class', 'qdiv qdivreq');
            }

            selid = formid + qa.qattr;
            sel.id = selid;
        });
    }

    async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }
    setremember = async function(formid, questions){
        asyncForEach(questions, async function(qa, qi, qarr){
            if (qa.remember){
                val = await cget(qa.qattr);
                console.log('REMEMBER ' + qa.qattr + ' ' + val);
                selid = formid + qa.qattr;
                sel = document.getElementById(selid);
                if (!val){ val = '';}
                sel.value = val;
            }
        });
    }
    asjson = function(response){
        return response.json();
    }
    loadto = function(divname, data, answers){
        load_questions(divname, data, answers);
    }
    loadjsonqs = function(qname, answers){
        var jname = 'static/js/' + qname + '_questions.json';
        var divname = 'new' + qname + '_questions';
        fetch(jname)
        .then(asjson)
        .then(function(data){ loadto(divname, data, answers); return data; })
        .then(function(data){ setremember(divname, data); });
    }
    session_answers = {}
    loadjsonqs('session', session_answers);
    person_answers = {}
    loadjsonqs('person', person_answers);

    var loadppl = async function(e){
        await vm.dbsync();
    }
    loadppl();
});
