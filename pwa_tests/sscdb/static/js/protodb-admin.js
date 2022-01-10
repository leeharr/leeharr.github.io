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
        idbKeyval.clear(pdbppl);
        idbKeyval.clear(pdbcfg);
    }
});
