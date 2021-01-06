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
