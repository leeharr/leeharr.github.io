'use strict';

window.showeditstaff = async function(){
    vm.showeditstaff(!vm.showeditstaff());
}
var editstaff = async function(){
    console.log('SAVE ES');

    let s = {};

    let form = document.getElementById('newstaff_questions');
    Array.from(form.children).forEach(function(div, i, arr){
        let qattr = div['data-qattr'];
        if (!qattr){ return; }

        console.log('qattr : '+qattr);
        let sel = div.children[1];
        let val = sel.value;
        console.log('   val : '+val);

        if (div['data-remember']){
            cset(qattr, val);
            sel.value = val;
        }
    });

    vm.showeditstaff(false);
}

window.shownewperson = async function(){
    var form = document.getElementById('newperson');
    if (form){
        form.reset();
    }

    let s = await cget('school');
    let se = document.getElementById('newperson_questionsschool');
    se.value = s;

    vm.personexists(false);
    vm.shownewperson(!vm.shownewperson());
    if (vm.selectedgroup()){
        vm.selectedgroup().savecancel();
    }
}
var newperson = async function(e){
    // e true if saving existing person
    console.log('new person form sent '+e);
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

    let i = 0;
    if (!e){
        i = await pgetnextid();
    } else {
        let xp = document.getElementById('xpersonid');
        i = xp.value;
    }
    console.log(i + ' - - ' + p.lname + ', ' + p.fname);
    pset(i, p);
    vm.addperson(i, p.lname, p.fname, p.gradestr);

    vm.shownewperson(false);
}
var saveperson = async function(){
    console.log('SAVE');
    await newperson(true);
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
    let sesname = `${g.name()}-${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}-${dt.getTime()}`;

    let sesdata = {'sesname': sesname};

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
            sel.value = '';
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
        psesdata['sent'] = false;

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
    vm.quickgroup(false);

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

var loadppl = async function(e){
    await vm.dbsync();
}
loadppl();

var checkunsent = async function(){
    let ks = await skeys();
    let us = 0;
    let ki = 0;
    for (let k of ks){
        if (k=='currid'){continue;}
        let s = await sget(k);
        console.log('cksent:' + k + '==' + s.sent);
        if (!s.sent){
            working.push(k);

            ki = parseInt(k);
            if (!us || (us && (ki-1) < us)){
                us = ki-1;
            }
        }
    }

    if (us){
        await cset('datasent', us);
    }

    if (working.length != 0){
        vm.sendworking(true);
        window.onbeforeunload = function(){
            return "WAIT!";
        }
        setTimeout(sendalltosheet, 200);
        setTimeout(checkdone, 200);
    }
}
checkunsent();
