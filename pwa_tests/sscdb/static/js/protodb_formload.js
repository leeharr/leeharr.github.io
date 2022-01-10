'use strict';

window.dateselector = function(div, req){
    //console.log('ADD DATE SELECTOR');
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
    console.log('DATE RESET to '+dtstr+' FOR '+dsel.id);
    dsel.max = dtstr;
    dsel.value = dtstr;
}
window.dateclear = function(dsel){
    console.log('DATE CLEARED '+dsel.id);
    dsel.value = '';
}

window.textinput = function(div, req){
    //console.log('ADD TEXT INPUT');
    let ti = document.createElement('input');
    ti.type = 'text';
    if (req){
        ti.required = true;
    }
    div.appendChild(ti);
    return ti;
}
window.textinputlarge = function(div, req){
    //console.log('ADD TEXT INPUT LARGE');
    let ti = document.createElement('textarea');
    ti.cols = "40";
    ti.rows = "2";
    if (req){
        ti.required = true;
    }
    div.appendChild(ti);
    return ti;
}
window.textinputreset = function(ti){
    ti.value = '';
}

window.withotherreset = function(sel){
    // used by select elements that have an "Other" option
    //console.log('WITH OTHER RESET');
    sel.value = '';
    sel._relother.value = '';
    sel._relother.style.visibility = 'hidden';
    sel._relother.required = false;
}

window.yesno = function(div, req){
    //console.log('YES NO Q');
    let dsel = document.createElement('div');

    let rbyes = document.createElement('input');
    rbyes.type = 'radio';
    rbyes.name = div.id + '_rbyesno';
    rbyes.id = rbyes.name + '_yes';
    dsel._yes = rbyes;
    let rbyespan = document.createElement('span');
    let rbyeslbl = document.createElement('label');
    rbyeslbl.setAttribute('for', rbyes.id);
    rbyeslbl.innerHTML = 'Yes';
    rbyespan.appendChild(rbyes);
    rbyespan.appendChild(rbyeslbl);
    dsel.appendChild(rbyespan);

    let rbno = document.createElement('input');
    rbno.type = 'radio';
    rbno.name = div.id + '_rbyesno';
    rbno.id = rbno.name + '_no';
    dsel._no = rbno;
    let rbnospan = document.createElement('span');
    let rbnolbl = document.createElement('label');
    rbnolbl.setAttribute('for', rbno.id);
    rbnolbl.innerHTML = 'No';
    rbnospan.appendChild(rbno);
    rbnospan.appendChild(rbnolbl);
    dsel.appendChild(rbnospan);

    if (req){
        rbyes.required = true;
    }

    div.appendChild(dsel);

    dsel.value = function(){
        // the "value" of the whole widget (Yes,No,or nothing)
        if (dsel._yes.checked){
            //console.log('YESNO - yes');
            return "Yes";
        } else if (dsel._no.checked) {
            //console.log('YESNO - no');
            return "No";
        } else {
            //console.log('YESNO - blank');
            return "";
        }
    }
    dsel.setvalue = function(v){
        //console.log('setting to '+v);
        dsel._yes.checked = false;
        dsel._no.checked = false;

        if (v == 'Yes'){
            dsel._yes.checked = true;
        } else if (v == 'No'){
            dsel._no.checked = true;
        }
    }

    return dsel;
}
window.yesnoreset = function(sel){
    //console.log('RESET YES NO');
    sel._yes.checked = false;
    sel._no.checked = false;
}

window.yesnocount = function(div, req){
    //console.log('YES NO COUNT Q');
    let dsel = document.createElement('div');

    let rbyes = document.createElement('input');
    rbyes.type = 'number';
    rbyes.name = div.id + '_rbyesnocount';
    rbyes.id = rbyes.name + '_yes';
    rbyes.min = 0;
    rbyes.size = 3;
    dsel._yes = rbyes;
    let rbyespan = document.createElement('span');
    let rbyeslbl = document.createElement('label');
    rbyeslbl.setAttribute('for', rbyes.id);
    rbyeslbl.innerHTML = 'Yes';
    rbyespan.appendChild(rbyes);
    rbyespan.appendChild(rbyeslbl);
    dsel.appendChild(rbyespan);

    let rbno = document.createElement('input');
    rbno.type = 'number';
    rbno.name = div.id + '_rbyesnocount';
    rbno.id = rbno.name + '_no';
    rbno.min = 0;
    rbno.size = 3;
    dsel._no = rbno;
    let rbnospan = document.createElement('span');
    let rbnolbl = document.createElement('label');
    rbnolbl.setAttribute('for', rbno.id);
    rbnolbl.innerHTML = 'No';
    rbnospan.appendChild(rbno);
    rbnospan.appendChild(rbnolbl);
    dsel.appendChild(rbnospan);

    div.appendChild(dsel);
    let errmsg = document.createElement('span');
    errmsg.innerHTML = 'More than attended.';
    errmsg.classList.add('spaceleft');
    errmsg.classList.add('spacehide');
    dsel._err = errmsg;
    dsel.appendChild(errmsg);

    dsel.value = function(){ return '::DSEL_VALUE_LATE::'; }

    dsel.value_late = function(){
        // the "value" of the whole widget (Yes,No,or nothing)
        if (dsel._yes.value > 0){
            dsel._yes.value -= 1;
            //console.log('YESNO - yes now: '+dsel._yes.value);
            return "Yes";
        } else if (dsel._no.value > 0) {
            dsel._no.value -= 1;
            //console.log('YESNO - no now: '+dsel._no.value);
            return "No";
        } else {
            //console.log('YESNO - blank');
            return "";
        }
    }

    return dsel;
}
window.yesnocountreset = function(sel){
    //console.log('RESET YES NO COUNT');
    sel._yes.value = '';
    sel._no.value = '';
    sel._err.classList.add('spacehide');
    let pn = sel.parentNode;
    pn.classList.remove('qdiverr');
}
window.yesnocountok = function(sel, nppl){
    // if the total of the count is more then the # of people, return false (error)
    //if (!sel._yes){ console.log('!YES ' + sel.id); return true; }
    //if (!sel._no){ console.log('!NO ' + sel.id); return true; }
    let yv = 0;
    let nv = 0;
    if (sel._yes.value){ yv = parseInt(sel._yes.value); }
    if (sel._no.value){ nv = parseInt(sel._no.value); }
    let totalcount =  yv + nv;
    //console.log('YNCO '+totalcount+' '+nppl);
    if (totalcount > nppl){
        let pn = sel.parentNode;
        pn.classList.add('qdiverr');
        sel._err.classList.remove('spacehide');
        return false;
    } else {
        return true;
    }
}

var load_questions = async function(formid, questions, answers){
    let form = document.getElementById(formid);
    if (!form){ return; }

    asyncForEach(questions, async function(qa, qi, qarr){
        let div = document.createElement('div');
        div.setAttribute('class', 'qdiv');
        div.id = qa.qattr+'div';
        div['data-qattr'] = qa.qattr;
        div['data-remember'] = qa.remember;
        //console.log('APPEND TO '+form+ ' ID '+ form.id);
        form.appendChild(div);
        let qspan = document.createElement('div');
        qspan.innerHTML = qa.q;
        div.appendChild(qspan);

        let sel;
        let selid = formid + qa.qattr;
        if (qa.a){
            // multiple choice (has list of answers)
            let withother = checkforother(qa.a);
            //console.log('OTHER?'+withother+'#');

            sel = document.createElement('select');
            div.appendChild(sel);

            answers[qa.qattr] = qa.a;
            //console.log(qa.qattr);
            //console.log(answers);

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

            if (withother){
                //console.log('WITH OTHER');
                qa.areset = 'withotherreset';
                let ti = document.createElement('input');
                ti.type = 'text';
                ti.required = false; // will be set later if 'Other' is selected
                ti.style.visibility = 'hidden'; // will reveal later
                div.appendChild(ti);
                ti.id = selid + '_other';
                sel._relother = ti;

                sel.onchange = function(){
                    let txt = sel.options[sel.selectedIndex].text;
                    //console.log('TI ONCH '+txt+'#');
                    if (othery(txt)){
                        ti.style.visibility = 'visible';
                        ti.required = true;
                    } else {
                        ti.style.visibility = 'hidden';
                        ti.required = false;
                    }
                }
            }

        } else {
            // otherwise, use widget setup function
            //console.log('look for ' + qa.af);
            let af = window[qa.af];
            sel = af(div, qa.req);
            //console.log('lfsel '+selid+' '+sel);
            //console.log('lfval '+sel.value);
        }

        if (qa.areset){
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
        } else if (qa.a) {
            // not required, but select widget is being used
            // set up the empty value
            qa.a[""] = "";
        }

        if (qa.placeholder){
            sel.placeholder = qa.placeholder;
        }

        if (qa.countok){
            sel['countok'] = window[qa.countok];
        }

        if (qa.remember=='offer'){
            // offer to remember
            //console.log('offer to remember '+qa.qattr);
            let orem = document.createElement('input');
            orem.id = 'remember_'+qa.qattr;
            orem.type = 'checkbox';
            let remdiv = document.createElement('div');
            remdiv.id = 'remdiv_'+qa.qattr;
            remdiv.className = 'remember';
            remdiv.innerHTML = 'Remember';
            remdiv.appendChild(orem);
            qspan.appendChild(remdiv);

            let setrem = await cget(orem.id);
            if (setrem){
                orem.checked = true;
            }
        }

        if (qa.sendas){
            //console.log('SET SENDAS '+qa.sendas);
            sel['sendas'] = qa.sendas;
        } else {
            //console.log('NO  SENDAS');
        }

        if (qa.only){
            setTimeout(function(){ set_only_later(qa.only, qa.qattr, div); }, 400);
        }

        //console.log('reset? '+sel.id+' '+sel);
        sel.id = selid;
    });
}

var set_only_later = function(only, attr, div){
    // questions that should be visible
    // only if some condition is true
    // (used currently for ATS-only questions)
    let parts = only.split('::');
    let section = parts[0];
    let question = parts[1];
    let marker = parts[2];

    let onlyselid = 'new'+section+'_questions'+question;
    let onlysel = document.getElementById(onlyselid);

    let anss;
    if (section=='staff'){
        anss = staff_answers[question];
    }

    let val = anss[onlysel.value];
    if (val && val.startsWith(marker)){
        div.style.display = 'block';
    } else {
        div.style.display = 'none';
    }

    onlysel.addEventListener('change', function(){
        //console.log('ONLY TI ONCH '+onlysel.text+'#');
        let val = anss[onlysel.value];
        if (val && val.startsWith(marker)){
            div.style.display = 'block';
        } else {
            div.style.display = 'none';
        }
    });
}


var setremember = async function(formid, questions){
    // restore remembered values when loading the form
    //console.log('setremember '+formid);
    asyncForEach(questions, async function(qa, qi, qarr){
        if (qa.remember){
            let val = await cget(qa.qattr);
            //console.log('REMEMBER ' + qa.qattr + ' ' + val);
            let selid = formid + qa.qattr;
            let sel = document.getElementById(selid);
            if (!val){ val = '';}
            //console.log('selval '+sel.value);
            if (sel.value instanceof Function){
                //console.log('val is function');
                sel.setvalue(val);
            } else {
                sel.value = val;
            }
        }
    });
}
var asjson = function(response){
    return response.json();
}
var loadto = function(divname, data, answers){
    load_questions(divname, data, answers);
}
var loadjsonqs = function(qname, answers, aftercall){
    let jname = 'static/js/' + qname + '_questions.json';
    let divname = 'new' + qname + '_questions';
    fetch(jname)
    .then(asjson)
    .then(function(data){ loadto(divname, data, answers); return data; })
    .then(function(data){ setremember(divname, data); })
    .then(function(){ if (aftercall){ aftercall(); }});
}

var loadstaffinfo = async function(){
    let sname = await cget('staffname');
    if (sname){
        vm.staffname(sname);
    }
    let pos = await cget('agency');
    if (pos){
        vm.agency(pos);
    }
    let url = await cget('sheetsurl');
    if (url){
        vm.sheetsurl(url);
    }
}

var session_answers = {}
loadjsonqs('session', session_answers, false);
var person_answers = {}
loadjsonqs('person', person_answers, false);
var staff_answers = {}
loadjsonqs('staff', staff_answers, loadstaffinfo);