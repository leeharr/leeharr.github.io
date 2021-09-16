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

let othery = function(txt){
    let ansl = txt.toLowerCase();
    console.log(ansl);
    if (ansl.startsWith('other')){
        return true;
    } else {
        return false;
    }
}
let checkforother = function(answers){
    console.log('CK OTH');
    for (let i=0; i<answers.length; i++){
        let ans = answers[i];
        if (othery(ans)){
            return true;
        }
    }
    return false;
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
                let ti = document.createElement('input');
                ti.type = 'text';
                ti.required = false; // will be set later if 'Other' is selected
                ti.style.visibility = 'hidden'; // will reveal later
                div.appendChild(ti);
                ti.id = selid + '_other';

                sel.onchange = function(){
                    console.log('TI ONCH');
                    let txt = this.text;
                    if (othery(txt)){
                        ti.style.visibility = 'visible';
                    } else {
                        ti.style.visibility = 'hidden';
                    }
                }
            }

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
