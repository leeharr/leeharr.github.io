'use strict';

var showsamplesheet = async function(e){
    let cols = ['Agency Name', 'Month', 'Staff Name', 'Student Name', 'Grade',
    'Service Units', 'sesname']
    let tbl = document.getElementById('samplesheet');

    //clear the table first
    while(tbl.rows.length > 0){tbl.deleteRow(0)};

    let thead = document.createElement('thead');
    tbl.appendChild(thead);
    let tr = document.createElement('tr');
    thead.appendChild(tr);
    for (let col of cols){
        let th = document.createElement('th');
        th.innerHTML = col;
        tr.appendChild(th);
    }

    let sk = await skeys();
    sk.reverse();

    let tbody = document.createElement('tbody');
    tbl.appendChild(tbody);
    for (let k of sk){
        if (k == 'currid'){ continue; }
        let tr = document.createElement('tr');
        tbody.appendChild(tr);
        let s = await sget(k);
        for (let col of cols){
            let td = document.createElement('td');
            td.innerHTML = s[col];
            tr.appendChild(td);
        }
    }
}

var ultest = function() {
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

var dltest = async function() {
    let dt = new Date();
    let m = dt.getMonth()+1;
    let d = dt.getDate();
    let y = dt.getFullYear();
    let filename = `protodb-${y}-${m}-${d}.json`;

    let dbppl = [];
    for (let k of await pkeys()){
        if (k=='currid'){ continue; }
        let p = await pget(k);
        p['id'] = k;
        dbppl.push(p);
    }

    let dbgrp = []
    for (let k of await gkeys()){
        if (k=='currid'){ continue; }
        let g = await gget(k);
        g['id'] = k;
        dbgrp.push(g);
    }

    let dbses = []
    for (let k of await skeys()){
        if (k=='currid'){ continue; }
        let s = await sget(k);
        s['id'] = k;
        dbses.push(s);
    }

    let db = {'people': dbppl, 'groups': dbgrp, 'sessions': dbses}

    let data = JSON.stringify(db);
    let blob = new Blob([data], {type: 'text/json'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        let elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

var logdb = async function(e){
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

var clearppl = function(e){
    idbKeyval.clear(pdbses);
    idbKeyval.clear(pdbgrp);
    idbKeyval.clear(pdbppl);
    idbKeyval.clear(pdbcfg);
}
