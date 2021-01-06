'use strict';

var pid0 = '0';

var getcurrid = async function(getter){
    let val = await getter('currid');
    if (val){ return val; }
    else { return pid0; }
}
var getnextid = async function(getter, setter){
    let s = await getter();
    let currid = parseInt(s);
    currid += 1;
    setter('currid', currid.toString());
    return currid.toString();
}

var pdbppl = new idbKeyval.Store('protodb-people');
var pset = function(key, value){ return idbKeyval.set(key, value, pdbppl);}
var pget = function(key){ return idbKeyval.get(key, pdbppl);}
var pkeys = function(){ return idbKeyval.keys(pdbppl);}
var pgetcurrid = async function(){ return getcurrid(pget); }
var pgetnextid = async function(){ return getnextid(pgetcurrid, pset); }

var pdbgrp = new idbKeyval.Store('protodb-groups');
var gset = function(key, value){ return idbKeyval.set(key, value, pdbgrp);}
var gget = function(key){ return idbKeyval.get(key, pdbgrp);}
var gkeys = function(){ return idbKeyval.keys(pdbgrp);}
var ggetcurrid = async function(){ return getcurrid(gget); }
var ggetnextid = async function(){ return getnextid(ggetcurrid, gset); }
var gnamex = async function(name){
    // return true if a group named <name> exists
    let ks = await gkeys();
    for (let k of ks){
        if (k == 'currid'){ continue; }
        let g = await gget(k);
        if (g.name == name){ return true; }
    }
    return false;
}

var pdbses = new idbKeyval.Store('protodb-sessions');
var sset = function(key, value){ return idbKeyval.set(key, value, pdbses);}
var sget = function(key){ return idbKeyval.get(key, pdbses);}
var skeys = function(){ return idbKeyval.keys(pdbses);}
var sgetcurrid = async function(){ return getcurrid(sget); }
var sgetnextid = async function(){ return getnextid(sgetcurrid, sset); }

var pdbcfg = new idbKeyval.Store('protodb-config');
var cset = function(key, value){ return idbKeyval.set(key, value, pdbcfg);}
var cget = function(key){ return idbKeyval.get(key, pdbcfg);}
var ckeys = function(){ return idbKeyval.keys(pdbcfg);}
var cgetcurrid = async function(){ return getcurrid(cget); }
var cgetnextid = async function(){ return getnextid(cgetcurrid, cset); }

var Person = function(pid, lname, fname, grade){
    let self = this;
    self.pid = ko.observable(pid);
    self.fname = ko.observable(fname);
    self.lname = ko.observable(lname);
    self.linitial = ko.observable(lname[0]);
    self.grade = ko.observable(grade);
}
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
var ProtoDBViewModel = function(){
    let self = this;
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

    self.people_bylf = ko.pureComputed(function(){
        return self.people.sorted(self.lfsort);
    });
    self.people_byfl = ko.pureComputed(function(){
        return self.people.sorted(self.flsort);
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
        let li = '';
        let prevp;
        for (let p of self.people_byfl()){
            if (p.fname()==fn && p.linitial()==li){
                p.linitial(p.lname().slice(0, 2));
                if (prevp){
                    prevp.linitial(prevp.lname().slice(0, 2));
                }
            }
            fn = p.fname();
            li = p.linitial();
            prevp = p;
        }
    }

    self.addperson = function(pid, lname, fname, grade){
        let p = new Person(pid, lname, fname, grade);
        self.people.push(p);
        self.setinitials();
        return p;
    }
    self.getperson = function(pid){
        console.log('GP '+pid);
        let match = ko.utils.arrayFirst(self.people(), function(i){
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
            self.addperson(k, p.lname, p.fname, p.gradestr);
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


window.shownewperson = function(){
    vm.shownewperson(!vm.shownewperson());
    if (vm.selectedgroup()){
        vm.selectedgroup().savecancel();
    }
}
var newperson = async function(e){
    console.log('new person form sent');
    vm.shownewperson(false);

    var p = {}

    var form = document.getElementById('newperson_questions');
    Array.from(form.children).forEach(function(div, i, arr){
        let qattr = div['data-qattr'];
        if (!qattr){ return; }

        console.log('qattr : '+qattr);
        let sel = div.children[1];
        let val = sel.value;
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

        if (div['data-remember']){
            cset(qattr, val);
            sel.value = val;
        }
    });

    var i = await pgetnextid();
    console.log(i + ' - - ' + p.lname + ', ' + p.fname);
    pset(i, p);
    vm.addperson(i, p.lname, p.fname, p.gradestr);

    vm.shownewperson(false);
}

var shownewgroup = function(){
    let gname = document.querySelector('#gname');
    gname.value = '';
    let gname_err = document.querySelector('#gname_err');
    gname_err.style.visibility = 'hidden';
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
var newgroup = async function(e){
    console.log('new group form sent');
    let gname = document.querySelector('#gname');
    let gname_err = document.querySelector('#gname_err');
    gname_err.style.visibility = 'hidden';

    let x = await gnamex(gname.value);
    if (x || gname.value.startsWith('QUICK')){
        // given group name is already in use
        gname_err.style.visibility = 'visible';
        gname_err.innerHTML = 'Group name already in use';
        return;
    }

    let g = {'name': gname.value, 'people': []}
    let i = await ggetnextid();
    console.log(i + ' .... ' + g.name);

    let ng = vm.addgroup(i, gname.value);

    let ks = await pkeys();
    for (let k of ks){
        if (k == 'currid') { continue; }
        let ngpid = '#ngpid' + k;
        let cb = document.querySelector(ngpid);
        if (cb.checked){
            console.log(ngpid + ' checked');
            g.people.push(k);
            let p = vm.getperson(k);
            if (p){ ng.addperson(p); }
        }
    }

    gset(i, g);

    gname.value = '';
    vm.shownewgroup(false);
    vm.selectedgroup(ng);
}
var savegroup = async function(gid){
    let g = await gget(gid);
    g.people = [];
    let vmg = vm.getgroup(gid);
    vmg.people.removeAll();
    let ks = await pkeys();
    for (let k of ks){
        if (k == 'currid') { continue; }
        let ngpid = '#ngpid' + k;
        let cb = document.querySelector(ngpid);
        if (cb.checked){
            console.log(ngpid + ' checked');
            g.people.push(k);
            let p = vm.getperson(k);
            if (p){ vmg.addperson(p); }
        }
    }
    gset(gid, g);

    vmg.updategroup(false);
    vm.updategroup(false);
}
window.quicksession = function(){
    let g = vm.quick_group();
    g.showgroup();
    g.newgroupsession();
    g.checkgroupcheckboxes(false);
}

function _age(dobstr) {
    if (!dobstr){ return 0; }
    let dob = new Date(dobstr);
    let ageDifMs = Date.now() - dob.getTime();
    let ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

var working = [];
var createsession = async function(){
    console.log('CREATE SESSION');
    vm.showgroupsession(false);

    vm.sendworking(true);

    window.onbeforeunload = function(){
        return "WAIT!";
    }

    let g = vm.selectedgroup();
    let dt = new Date();
    let sesname = `${g.name()}-${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}-${dt.getTime()}`

    let sesdata = {'sesname': sesname}

    var form = document.getElementById('newsession_questions');
    Array.from(form.children).forEach(function(div, i, arr){
        let qattr = div['data-qattr'];
        console.log('qattr : '+qattr);
        let sel = div.children[1];
        let val = sel.value;
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

    let ppl = g.people();
    let rmgroup = false;
    if (g.name() == 'QUICK'){ ppl = vm.people(); rmgroup = true; }
    for (let p of ppl){
        let pid = p.pid();

        let gspid = '#gspid'+pid;
        let cb = document.querySelector(gspid);
        if (cb && !cb.checked){
            console.log('NOT SEL: '+pid);
            continue;
        }

        let psesdata = Object.assign({}, sesdata);
        psesdata['pid'] = pid;

        let dbp = await pget(pid);

        psesdata['schoolstr'] = dbp.schoolstr;
        psesdata['lname'] = p.linitial();
        psesdata['fname'] = dbp.fname;
        psesdata['grade'] = dbp.gradestr;
        psesdata['age'] = _age(dbp.dob).toString();

        let sid = await sgetnextid();
        await sset(sid, psesdata);

        working.push(sid);
    }

    if (rmgroup){
        vm.groups.remove(g);
    }

    vm.showgroupsession(false);
    vm.showpersoncheckboxes(false);
    vm.selectedgroup(undefined);
    vm.checkpersoncheckboxes(false);

    setTimeout(sendalltosheet, 2000);
    setTimeout(checkdone, 200);
}

var checkdone = function(){
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
var hts = function(o){
    let ss = [];
    for (let k of Object.keys(o)){
        let s = addnv(k, o[k]);
        ss.push(s);
    }
    return ss.join('&');
}
var sheetsurl = 'https://script.google.com/macros/s/AKfycbyZ-qmvpF2iu8Gn4js_3HaiM36l537DEZPhk7BzYjC1TjMWcHg/exec'
var sendonetosheet = async function(o){
    let d = hts(o);
    fetch(sheetsurl+'?'+d)
    .then(function(response){ console.log('responded'); working.pop(); })
    .catch(function(error){ console.log('err ' + error); })
}
var sendalltosheet = async function(){
    let sentthrough = await cget('datasent');
    sentthrough = parseInt(sentthrough);
    console.log('sending from ' + sentthrough);

    for (let k of await skeys()){
        if (k=='currid'){ continue; }

        let sid = parseInt(k);
        if (sid <= sentthrough){ continue; }

        let s = await sget(k);
        s['id'] = k;
        sendonetosheet(s);
    }
    let scurid = await sgetcurrid();
    cset('datasent', scurid);
    console.log('... to ' + scurid);
}

window.dateselector = function(div, req){
    console.log('ADD DATE SELECTOR');
    let dsel = document.createElement('input');
    dsel.type = 'date';
    let dt = new Date();
    let m = dt.getMonth()+1;
    if (m<10){ m = '0'+m;}
    let d = dt.getDate();
    if (d<10){ d = '0'+d;}
    let y = dt.getFullYear();
    let dtstr = `${y}-${m}-${d}`;
    dsel.max = dtstr;
    if (req){
        dsel.required = true;
    }
    div.appendChild(dsel);
    return dsel;
}
window.datereset = function(dsel){
    let dt = new Date();
    let m = dt.getMonth()+1;
    if (m<10){ m = '0'+m;}
    let d = dt.getDate();
    if (d<10){ d = '0'+d;}
    let y = dt.getFullYear();
    let dtstr = `${y}-${m}-${d}`;
    console.log('DATE RESET to '+dtstr);
    dsel.value = dtstr;
}
window.dateclear = function(dsel){
    dsel.value = '';
}

window.textinput = function(div, req){
    console.log('ADD TEXT INPUT');
    let ti = document.createElement('input');
    ti.type = 'text';
    if (req){
        ti.required = true;
    }
    div.appendChild(ti);
    return ti;
}
window.textinputreset = function(ti){
    ti.value = '';
}

var load_questions = async function(formid, questions, answers){
    let form = document.getElementById(formid);
    if (!form){ return; }

    questions.forEach(function(qa, qi, qarr){
        let div = document.createElement('div');
        div.setAttribute('class', 'qdiv');
        div['data-qattr'] = qa.qattr;
        div['data-remember'] = qa.remember;
        console.log('APPEND TO '+form+ ' ID '+ form.id);
        form.appendChild(div);
        let qspan = document.createElement('div');
        qspan.innerHTML = qa.q;
        div.appendChild(qspan);

        let sel;
        if (qa.a){
            sel = document.createElement('select');
            div.appendChild(sel);

            answers[qa.qattr] = qa.a;

            let op = document.createElement('option');
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
            let af = window[qa.af];
            sel = af(div, qa.req);
            let areset = window[qa.areset];
            sel['data-reset'] = areset;
            areset(sel);
        }

        if (qa.req){
            sel.required = true;
            let qreq = document.createElement('span');
            qreq.innerHTML = '*';
            qreq.setAttribute('class', 'qreq');
            qspan.appendChild(qreq);
            div.setAttribute('class', 'qdiv qdivreq');
        }

        let selid = formid + qa.qattr;
        sel.id = selid;
    });
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
var setremember = async function(formid, questions){
    asyncForEach(questions, async function(qa, qi, qarr){
        if (qa.remember){
            let val = await cget(qa.qattr);
            console.log('REMEMBER ' + qa.qattr + ' ' + val);
            let selid = formid + qa.qattr;
            let sel = document.getElementById(selid);
            if (!val){ val = '';}
            sel.value = val;
        }
    });
}
var asjson = function(response){
    return response.json();
}
var loadto = function(divname, data, answers){
    load_questions(divname, data, answers);
}
var loadjsonqs = function(qname, answers){
    let jname = 'static/js/' + qname + '_questions.json';
    let divname = 'new' + qname + '_questions';
    fetch(jname)
    .then(asjson)
    .then(function(data){ loadto(divname, data, answers); return data; })
    .then(function(data){ setremember(divname, data); });
}
var session_answers = {}
loadjsonqs('session', session_answers);
var person_answers = {}
loadjsonqs('person', person_answers);

var loadppl = async function(e){
    await vm.dbsync();
}
loadppl();

