'use strict';

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

window.withotherreset = function(sel){
    console.log('WITH OTHER RESET');
    sel.value = '';
    sel._relother.value = '';
    sel._relother.style.visibility = 'hidden';
    sel._relother.required = false;
}

window.yesno = function(div, req){
    console.log('YES NO Q');
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
        if (this._yes.checked){
            return 'Yes';
        } else {
            return 'No';
        }
    }
    dsel.value.bind(dsel);

    return dsel;
}
window.yesnoreset = function(sel){
    console.log('RESET YES NO');
    sel._yes.checked = false;
    sel._no.checked = false;
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
        let selid = formid + qa.qattr;
        if (qa.a){
            let withother = checkforother(qa.a);
            console.log('OTHER?'+withother+'#');

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

            if (withother){
                console.log('WITH OTHER');
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
                    console.log('TI ONCH '+txt+'#');
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
            console.log('look for ' + qa.af);
            let af = window[qa.af];
            sel = af(div, qa.req);
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
        }

        sel.id = selid;
    });
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
    let pos = await cget('position');
    if (pos){
        vm.position(pos);
    }
}

var session_answers = {}
loadjsonqs('session', session_answers, false);
var person_answers = {}
loadjsonqs('person', person_answers, false);
var staff_answers = {}
loadjsonqs('staff', staff_answers, loadstaffinfo);
