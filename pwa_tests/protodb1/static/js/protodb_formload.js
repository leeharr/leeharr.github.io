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
