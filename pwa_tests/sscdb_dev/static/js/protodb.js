'use strict';

window.showeditstaff = async function(){
    vm.showeditstaff(!vm.showeditstaff());

    if (vm.showeditstaff()){
        // show remembered values
        let form = document.getElementById('newstaff_questions');
        let fc = Array.from(form.children);
        for (let i=0; i<fc.length; i++){
            let div = fc[i];
            let qattr = div['data-qattr'];
            if (!qattr){ return; }
            let sel = div.children[1];

            let val;
            if (div['data-remember']){
                val = await cget(qattr);
                if (val){
                    sel.value = val;
                }
            }

            let sa = staff_answers[qattr];
            let othq = false;
            let otha = '';
            console.log('SESA '+othq+' '+otha);
            if (sa && val){
                othq = checkforother(sa);
                if (othq){
                    otha = othery(sa[val]);
                } else {
                    otha = '';
                }
                console.log('SESB '+othq+' '+otha);
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
        }
    }
}
var editstaff = async function(){
    //console.log('SAVE ES');

    let s = {};

    let form = document.getElementById('newstaff_questions');
    let fc = Array.from(form.children);
    let arr = fc;
    for (let i=0; i<fc.length; i++){
        let div = fc[i];
        let qattr = div['data-qattr'];
        if (!qattr){ return; }

        //console.log('qattr : '+qattr);
        let sel = div.children[1];
        let val = sel.value;
        //console.log('   val : '+val);

        if (div['data-remember']){
            cset(qattr, val);
            sel.value = val;
        }

        let sa = staff_answers[qattr];
        let othq = false;
        let otha = '';
        if (sa){
            console.log('SA OTHER');
            othq = checkforother(sa);
            if (othq){
                otha = othery(sa[val]);
            } else {
                otha = '';
            }
            console.log('OT Q A '+othq+' '+otha);
            if (othq && otha){
                // question has an "Other" option, AND
                // "Other" has been selected
                let qattr_other = qattr + '_other';
                let subsel = div.children[2];
                let sendval = subsel.value;
                console.log('SUBSELV '+sendval);
                await cset(qattr_other, sendval);

                if (qattr=='agency'){
                    vm.agency_other(sendval);
                }
            }
        }
    }

    vm.showeditstaff(false);

    setTimeout(editstaff_after, 400);
}

var editstaff_after = async function(){
    let sname = await cget('staffname');
    vm.staffname(sname);
    let pos = await cget('agency');
    vm.agency(pos);
    let url = await cget('sheetsurl');
    vm.sheetsurl(url);
}

window.shownewperson = async function(){
    let form = document.getElementById('newperson');
    if (form){
        form.reset();
    }

//     let s = await cget('school');
//     let se = document.getElementById('newperson_questionsschool');
//     se.value = s;

    form = document.getElementById('newperson_questions');
    let fc = Array.from(form.children);
    for (let i=0; i<fc.length; i++){
        let div = fc[i];
        let qattr = div['data-qattr'];
        if (!qattr){ return; }
        let sel = div.children[1];

        if (sel['data-reset']){
            // Set "Initial Contact" date to today
            console.log('DATA RESET '+sel.id);
            sel['data-reset'](sel);
        }

        let rem = div['data-remember'];
        if (rem){
            let val = await cget(qattr);
            let dorem = true;

            if (rem=='offer'){
                let getremid = 'remember_'+qattr;
                let getrem = document.getElementById(getremid);
                let orem = await cget(getremid);
                if (orem){
                    getrem.checked = true;
                } else {
                    dorem = false;
                }
            }

            if (dorem && val){
                sel.value = val;
            }
        }
    }

    let sg = -1;
    if (vm.selectedgroup()){
        sg = vm.selectedgroup().gid();
    }

    let ks = await gkeys();
    for (let gid of ks){
        if (gid == 'currid') { continue; }
        let npgid = '#npgid' + gid;
        let cb = document.querySelector(npgid);
        if (sg>=0 && gid==sg){
            cb.checked = true;
        } else {
            cb.checked = false;
        }
    }

    vm.personexists(false);
    vm.shownewperson(!vm.shownewperson());
    if (vm.selectedgroup()){
        vm.selectedgroup().savecancel();
    }
}
var newperson = async function(e){
    // e true if saving existing person
    //console.log('new person form sent '+e);
    vm.shownewperson(false);

    var p = {}

    var form = document.getElementById('newperson_questions');
    Array.from(form.children).forEach(function(div, i, arr){
        let qattr = div['data-qattr'];
        if (!qattr){ return; }

        //console.log('qattr : '+qattr);
        let sel = div.children[1];
        let val = sel.value;
        //console.log('   val : '+val);
        p[qattr+'id'] = val;
        if (person_answers[qattr]){
            //console.log('     a : '+person_answers[qattr][val]);
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

        // check if need to remember value
        console.log('CHK REM');
        let getremid = 'remember_'+qattr;
        let getrem = document.getElementById(getremid);
        let remember = false;
        //console.log(getremid+' '+getrem);
        if (getrem){
            // remember if they want to remember
            if (getrem.checked){
                //console.log('getrem chkd');
                remember = true;
                cset(getremid, true);
            } else {
                cset(getremid, '');
            }
        }
    });

    let i = 0;
    let active = true;
    if (!e){
        i = await pgetnextid();
    } else {
        let xp = document.getElementById('xpersonid');
        i = xp.value;
        let porig = vm.getperson(i);
        active = porig.active();
    }
    p.active = active;

    //console.log(i + ' - - ' + p.lname + ', ' + p.fname);
    pset(i, p);
    let vmp = vm.addperson(i, p.lname, p.fname, p.gradestr, false);
    vmp.stid(p.stid);
    vmp.active(active);
    vm.base_initials();
    vm.setinitials2();

    // check if adding new person to any groups
    let ks = await gkeys();
    for (let gid of ks){
        if (gid == 'currid') { continue; }
        let npgid = '#npgid' + gid;
        let cb = document.querySelector(npgid);
        if (cb.checked){
            //console.log(npgid + ' checked');
            let g = await gget(gid);
            g.people.push(i);
            let vmg = vm.getgroup(gid);
            vmg.addperson(vmp);
            gset(gid, g);
            cb.checked = false;
        }
    }

    vm.shownewperson(false);
    vm.shownewgroup(false);
}
var saveperson = async function(){
    //console.log('SAVE');
    await newperson(true);
}
var deactivate_person = async function(){
    //console.log('DEACTIVATE');
    let xp = document.getElementById('xpersonid');
    let pid = xp.value;
    let p = vm.getperson(pid);
    let deac = document.getElementById('deactivate');
    let del = document.getElementById('delete');

    let dbp = await pget(pid);
    if (dbp.active === false){
        dbp.active = true;
        p.active(true);
        //console.log('INACTIVE '+pid+' --> ACTIVE');
        deac.innerHTML = 'Deactivate';
        del.style.visibility = 'hidden';
    } else {
        dbp.active = false;
        p.active(false);
        //console.log('ACTIVE '+pid+' --> INACTIVE');
        deac.innerHTML = 'Activate';
        del.style.visibility = 'visible';
    }
    await pset(pid, dbp);
}
var delete_person = function(){
    let xp = document.getElementById('xpersonid');
    let pid = xp.value;
    let p = vm.getperson(pid);
    let conf = window.confirm('DELETE record permanently?\n\n'+p.fname()+' '+p.lname());
    if (conf){
        delete_person_confirmed(pid);
    }
}
var delete_person_confirmed = async function(pid){
    //console.log('DELETING PERMANENTLY '+pid);
    vm.delete_person(pid);
    vm.shownewperson(false);
    vm.shownewgroup(false);
    vm.personexists(false);
    setTimeout(vm.recalc_initials, 300);
}

var deactivate_group = async function(){
    //console.log('DEAC GRP');

    let xgid = document.getElementById('xgroupid');
    let gid = xgid.value;
    if (!gid||gid=='0'){
        //console.log('XGID NO');
        return;
    }

    let g = await gget(gid);
    let vmg = vm.getgroup(gid);

    let deac = document.getElementById('deacgrp');
    if (deac.innerHTML == 'Activate'){
        g.active = true;
        vmg.active(true);
        deac.innerHTML = 'Deactivate';
    } else {
        g.active = false;
        vmg.active(false);
        deac.innerHTML = 'Activate';
    }

    await gset(gid, g);
}
var selectedgroup_inactive = function(){
    let sg = vm.selectedgroup();
    if (sg && !sg.active()){
        return true;
    } else {
        return false;
    }
}
var delete_group = async function(){
    //console.log('DELETE GRP');
    let sg = vm.selectedgroup();
    let conf = window.confirm('DELETE record permanently?\n\n'+sg.name());
    if (conf){
        delete_group_confirmed();
    }
}
var delete_group_confirmed = async function(){
    //console.log('DELETE');
    let sg = vm.selectedgroup();
    let gid = sg.gid();
    vm.delete_group(gid);

    let gname = document.querySelector('#gname');
    gname.value = '';
    vm.shownewgroup(false);
    vm.updategroup(false);
    vm.selectedgroup(undefined);
    vm.checkpersoncheckboxes(false);
    vm.showpersoncheckboxes(false);
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
        let vmsg = vm.selectedgroup();
        if (vmsg){
            vmsg.updategroup(false);
        }
        vm.updategroup(false);
        vm.showpersoncheckboxes(false);
        vm.selectedgroup(undefined);
        vm.checkpersoncheckboxes(false);
    }
}
var newgroup = async function(e){
    //console.log('new group form sent');

    let gname = document.querySelector('#gname');
    let gname_err = document.querySelector('#gname_err');
    let x = await gnamex(gname.value);
    if (x || gname.value.startsWith('QUICK')){
        // given group name is already in use
        gname_err.style.visibility = 'visible';
        gname_err.innerHTML = 'Group name already in use';
        return;
    }
    gname_err.style.visibility = 'hidden';


    let sgb = document.getElementById('creategroupbtn');
    //console.log('sgbval ' + sgb.value);
    let sg = vm.selectedgroup();
    if (sg && sgb.value=='Save'){
        let gid = sg.gid();
        return savegroup(gid);
    }


    let g = {'name': gname.value, 'people': [], 'active': true}
    let i = await ggetnextid();
    //console.log(i + ' .... ' + g.name);

    let ng = vm.addgroup(i, gname.value);

    let ks = await pkeys();
    for (let k of ks){
        if (k == 'currid') { continue; }
        let ngpid = '#ngpid' + k;
        let cb = document.querySelector(ngpid);
        if (cb.checked){
            //console.log(ngpid + ' checked');
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
    //console.log('SAVEGRP');

    let g = await gget(gid);
    let gname = document.querySelector('#gname');
    if (gname.value){
        g.name = gname.value;
    }
    g.people = [];
    let vmg = vm.getgroup(gid);
    vmg.name(g.name);
    vmg.people.removeAll();
    let ks = await pkeys();
    for (let k of ks){
        if (k == 'currid') { continue; }
        let ngpid = '#ngpid' + k;
        let cb = document.querySelector(ngpid);
        if (cb.checked){
            //console.log(ngpid + ' checked');
            g.people.push(k);
            let p = vm.getperson(k);
            if (p){ vmg.addperson(p); }
        }
    }
    gset(gid, g);

    gname.value = '';
    vm.shownewgroup(false);
    vmg.updategroup(false);
    vm.updategroup(false);
    vm.selectedgroup(undefined);
    vm.checkpersoncheckboxes(false);
    vm.showpersoncheckboxes(false);
}
var editgroup = function(){
    //console.log('edit group');
    let g = vm.selectedgroup();
    shownewgroup();
    let gname = document.querySelector('#gname');
    gname.value = g.name();
    let xgid = document.getElementById('xgroupid');
    xgid.value = g.gid();
    let cgbtn = document.querySelector('#creategroupbtn');
    cgbtn.value = 'Save';
    g.showgroup();
    vm.updategroup(true);

    let deac = document.getElementById('deacgrp');
    if (g.active()){
        deac.innerHTML = 'Deactivate';
    } else {
        deac.innerHTML = 'Activate';
    }
}
window.quicksession = function(){
    let g = vm.quick_group();
    g.showgroup();
    g.newgroupsession(true);
//     g.checkgroupcheckboxes(false); // moved to g.newgroupsession
}

function _age(dobstr) {
    if (!dobstr){ return 0; }
    let dob = new Date(dobstr);
    let ageDifMs = Date.now() - dob.getTime();
    let ageDate = new Date(ageDifMs); // miliseconds from epoch
    let a = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (a >= 20){
        a = '20+';
    }
    return a;
}

var working = [];
var chkcreatesession = function(){
    console.log('CHK CREATE SESS');
    let ppl = vm.people();
    let count = 0;
    for (let p of ppl){
        let pid = p.pid();

        let gspid = '#gspid'+pid;
        let cb = document.querySelector(gspid);
        if (!cb){
            //console.log('BROK '+gspid);
        } else if (cb && cb.checked){
            //console.log('SEL: '+pid);
            count++;
        } else {
            //console.log('NSEL '+pid);
        }
    }

    let err = false;
    var form = document.getElementById('newsession_questions');
    let fields = Array.from(form.children);
    for (i=0; i<fields.length; i++){
        let div = fields[i];
        let qattr = div['data-qattr'];
        //console.log('ck count on qattr : '+qattr);
        let sel = div.children[1];

        if (sel['data-req']){
            let valid = sel['data-req'](div);
            if (!valid){
                sel['data-err'](div);
                return;
            }
        }

        if (!sel['countok']){
            //console.log('  NO CK');
            continue;
        } else {
            //console.log('  CK');
        }
        let cokf = sel['countok'];
        //console.log('COKF '+cokf);
        if (!cokf(sel, count)){
            err = true;
            // more counted than ppl in session. set error.
            //console.log('COUNT ERROR');
            //let kgdiv = document.getElementById('knowledgegaindiv');
            let pn = sel.parentNode;
            //console.log('SCROLLTO '+pn);
//            setTimeout(pn.scrollIntoView, 500);
            sel.scrollIntoView();
        }
    }

    if (err){
        return;
    }

    if (!count){
        //console.log('NONE SELECTED');
        let smr = document.getElementById('session_members_reminder');
        smr.classList.add('qdiverr');
        setTimeout(scrolltop, 300);
    } else {
        //console.log('COUNT '+count);
        setTimeout(createsession, 200);
    }
}


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
    let late = {};

    let perpersons = {};

    var form = document.getElementById('newsession_questions');
    Array.from(form.children).forEach(function(div, i, arr){
        let qattr = div['data-qattr'];
        //console.log('qattr : '+qattr);
        let sel = div.children[1];
        //console.log('selid '+sel.id);
        let val = sel.value;
        //console.log('   val : '+val);
        if (!val instanceof Function){
            sesdata[qattr+'id'] = val;
        }
        let sa = session_answers[qattr];
        let theval; // either val or val()
        let sendval;
        let othq = false;
        let otha = '';
        let subsel;
        if (sa){
            othq = checkforother(sa);
            if (othq){
                otha = othery(sa[val]);
            } else {
                otha = '';
            }
            //console.log('     a : '+sa[val]);
            //console.log('OTHER? '+othq+' '+otha);
            if (othq && otha){
                subsel = div.children[2];
                //console.log('sel '+sel);
                sendval = subsel.value;
                //console.log('val '+sendval);
//                 sesdata[qattr+'str'] = val;
                subsel.value = '';
            } else {
                sendval = sa[val];
//                 sesdata[qattr+'str'] = sa[val];
            }
            theval = val;
            sel.value = '';
        } else if (div.perval){
            perpersons[qattr] = div;
        } else if (val instanceof Function){
            //console.log('VAL FUNC '+qattr);
            theval = val();
            //console.log('theval- '+theval);
            sendval = theval;
//             sesdata[qattr+'str'] = theval;
            if (theval == '::DSEL_VALUE_LATE::'){
                //console.log('setlate '+qattr);
                late[qattr] = sel;
            } else {
                sel['data-reset'](sel);
            }
        } else {
            //console.log('else val');
            sendval = val;
//             sesdata[qattr+'str'] = val;
            sel['data-reset'](sel);
            theval = val;
        }

        let sendas = sel['sendas'];
        //console.log('SENDAS '+qattr+' '+sendas);
        if (sendas==false){
            // not sending
            console.log('NOT SENDING '+qattr);
        } else if (sel['sendas']){
            //console.log(sel['sendas']+'='+sendval);
            sesdata[sel['sendas']] = sendval;
        } else {
            //console.log(qattr+'='+sendval);
            sesdata[qattr] = sendval;
        }

        // Check if user wants to save/restore this value
        //console.log('CHK REM');
        let getremid = 'remember_'+qattr;
        let getrem = document.getElementById(getremid);
        let remember = false;
        //console.log(getremid+' '+getrem);
        if (getrem){
            // remember if they want to remember
            if (getrem.checked){
                //console.log('getrem chkd');
                remember = true;
                cset(getremid, true);
            } else {
                cset(getremid, '');
            }
        }
        //console.log('after getremchk '+div['data-remember']+' '+remember);

        let qattr_other = qattr + '_other';
        if (div['data-remember'] || remember){
            // remember the value
            //console.log('DRR '+qattr+' '+theval);
            cset(qattr, theval);
            if (val instanceof Function && sel.setvalue instanceof Function){
                // yesno questions
                //console.log('setvalue func');
                sel.setvalue(theval);
            } else if (val instanceof Function){
                // should not happen
                //console.log('?????');
            } else {
                //console.log('=val ' + val + theval);
                sel.value = val;
            }

            if (othq && otha){
                cset(qattr_other, sendval);
                subsel.value = sendval;
            } else if (othq) {
                cset(qattr_other, '');
            }
        } else if (othq){
            cset(qattr_other, '');
        }
    });

    //sesdata['staffname'] = vm.staffname();
    //sesdata['positionstr'] = vm.positionname();
    var form = document.getElementById('newstaff_questions');
    console.log('=STAFF QUESTIONS=');
    Array.from(form.children).forEach(function(div, i, arr){
        let qattr = div['data-qattr'];
        console.log('qattr : '+qattr);
        let sel = div.children[1];
        let val = sel.value;
        console.log('   val : '+val);

        if (!val instanceof Function){
            sesdata[qattr+'id'] = val;
        }
        let sa = staff_answers[qattr];
        let sendval;
        if (qattr=='agency'){
            // Use agencyname (which accounts for Other:)
            sendval = vm.agencyname();
        } else if (sa){
            sendval = sa[val];
        } else {
            sendval = val;
        }

        let sendas = sel['sendas'];
        if (sendas==false){
            // not sending
        } else if (sel['sendas']){
            //console.log(sel['sendas']+'='+sendval);
            sesdata[sel['sendas']] = sendval;
        } else {
            //console.log(qattr+'='+sendval);
            sesdata[qattr] = sendval;
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
            //console.log('NOT SEL: '+pid);
            continue;
        } else if (!p.active()){
            //console.log('INACIVE NO SEND '+p.linitial());
            continue;
        }

        let psesdata = Object.assign({}, sesdata);
        psesdata['pid'] = pid;

        let dbp = await pget(pid);

        //psesdata['lname'] = p.linitial();
        //psesdata['fname'] = dbp.fname;
        psesdata['Student Name'] = dbp.fname + ' ' + p.linitial();
        //psesdata['Student ID'] = dbp.stidstr;
        //psesdata['School'] = dbp.schoolstr;
        psesdata['Grade'] = dbp.gradestr;
        psesdata['Age'] = _age(dbp.dob).toString();
        //psesdata['Gender'] = dbp.genderstr;
        //psesdata['Race'] = dbp.racestr;
        psesdata['sent'] = false;

        for (let qatr in late){
            let sel = late[qatr];
            let val = sel.value_late();
            let sendas = sel['sendas'];
            //console.log('getlate '+qatr+' : '+val+' sendas '+sendas);
            psesdata[sendas] = val;
        }

        for (let qatr in perpersons){
            let div = perpersons[qatr];
            let sel = div.children[1];
            let getr = div.perval;
            let val = getr(pid);
            let sendas = sel['sendas'];
            console.log('perperson '+qatr+'('+pid+') : '+val+' sendas '+sendas);
            psesdata[sendas] = val;
        }

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

    reset_session_questions();

    setTimeout(sendalltosheet, 1000);
    setTimeout(checkdone, 200);
    setTimeout(scrolltop, 500);
}

var checkdone = function(){
    if (working.length != 0){
        setTimeout(checkdone, 200);
    } else {
        vm.sendworking(false);
        vm.unsentdata(false);
        window.onbeforeunload = null;
    }
}

var loadppl = async function(e){
    await vm.dbsync();
    vm.setinitials2();
}
loadppl();

var checkunsent = async function(){
    let ks = await skeys();
    let us = 0;
    let ki = 0;
    for (let k of ks){
        if (k=='currid'){continue;}
        let s = await sget(k);
        //console.log('cksent:' + k + '==' + s.sent);
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
