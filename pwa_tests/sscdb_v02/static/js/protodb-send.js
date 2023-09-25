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

    var senddata = document.getElementById('senddata');

    selectsenddata = function(){
        senddata.select();
    }
    copysenddata = function(){
        senddata.select();
        document.execCommand('copy');
    }
    markdatasent = async function(){
        scurid = await sgetcurrid();
        cset('datasent', scurid);
        sent = document.getElementById('sent');
        sent.innerHTML = 'MARKED';
        sent.disabled = true;
    }

    load_data = async function(){
        sentthrough = await cget('datasent');
        sentthrough = parseInt(sentthrough);

        dbses = []
        for (k of await skeys()){
            if (k=='currid'){ continue; }

            sid = parseInt(k);
            if (sid <= sentthrough){ continue; }

            s = await sget(k);
            s['id'] = k;
            dbses.push(s);
        }

        if (dbses.length != 0){
            db = {'sessions': dbses}

            data = JSON.stringify(db);

            senddata = document.getElementById('senddata');
            senddata.innerHTML = data;
            senddata.select();
        } else {
            senddata.innerHTML = 'NO DATA TO SEND';
            markdatasent();
        }
    }

    load_data();
});
