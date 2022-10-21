'use strict';

//'https://script.google.com/macros/s/AKfycbyZ-qmvpF2iu8Gn4js_3HaiM36l537DEZPhk7BzYjC1TjMWcHg/exec'

function urlencode(str) {
    return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/%20/g, '+');
}

function addnv(name, value) {
    /* return urlencoded name-value pair */
    return urlencode(name) + '=' + urlencode(value);
}

var hts = function(o){
    /* encode and join up elements in Object o */
    let ss = [];
    for (let k of Object.keys(o)){
        let s = addnv(k, o[k]);
        //console.log('HTS: '+s)
        ss.push(s);
    }
    return ss.join('&');
}

var aftersend = async function(response, sid, sheetsurl){
    // successfully sent
    // rmv from working set and mark sent
    //console.log('responded '+sid);
    working.pop();
    let s = await sget(sid);
    s.sent = true;
    if (s.sheetsurl != sheetsurl){
        //console.log('FIXED URL '+s.sheetsurl+' .to. '+sheetsurl);
        s.sheetsurl = sheetsurl;
    }
    await sset(sid, s);
}

var sendonetosheet = async function(o){
    let sheetsurl = vm.sheetsurl();
    //console.log('Sending to: '+sheetsurl);
    let d = hts(o);
    let sid = o.id;
    fetch(sheetsurl+'?'+d)
    .then(function(response){aftersend(response, sid, sheetsurl);})
    .catch(function(error){
        console.log('err ' + error);
        vm.unsentdata(true);
        setTimeout(allowclose, 5000);
    })
}

var allowclose = function(){
    vm.sendworking(false);
    window.onbeforeunload = null;
}

// var testonetosheet = async function(o){
//     //test data
//     let oo = {
//         // School-test
//         //'entry.2116668805': 'AST1',
//         "School-test": "BST1",
//
//         // Student Name-test
//         //'entry.224351746': 'ASN I',
//         "Student Name-test": "BSN1",
//
//         // Date-test
//         //'entry.1039559589_year': "2004",
//         //'entry.1039559589_month': "02",
//         //'entry.1039559589_day': "03",
//         "Date-test": "02/03/2004",
//
//         // Follow Ups-test
//         //'entry.421530539': 'AFU1'
//         "Follow ups-test": "BFU1"
//     }
//     let d = hts(oo);
//     let sid = o.id;
//     let sheetsurl = 'https://script.google.com/macros/s/AKfycbx1ICdTvqR311-c90hw6cVxWA3BY85t1hh6VfT_Jgr8QZ_1-M0SGpQFzupghU9dZxDf/exec';
//     fetch(sheetsurl+'?'+d)
//     .then(function(response){aftersend(response, sid);})
//     .catch(function(error){ console.log('err ' + error); })
// }

// var sendonebyform = async function(o){
//     // alternate method, sends data by google form
//     // instead of directly to google sheet
//
//     //test data
//     o = {
//         // School-test
//         'entry.2116668805': 'AST1',
//         // Student Name-test
//         'entry.224351746': 'ASN I',
//         // Date-test
//         'entry.1039559589_year': "2004",
//         'entry.1039559589_month': "02",
//         'entry.1039559589_day': "03",
//         // Follow Ups-test
//         'entry.421530539': 'AFU1'}
//
//     let p = new URLSearchParams(o);
//
//     let url = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLScOg6zc7RK_mkeoxafCUmkXHE3M-gzw4kPSzabCG5RLQXGDDA/formResponse';
//
//     fetch(url, {
//         'method': 'POST',
//         'body': p,
//         'headers': {
//             'Content-Type': 'application/x-www-form-urlencoded',
//         },
//     })
//     .then(function(response){aftersend(response, sid);})
//     .catch(function(error){console.log('err'+error);})
// }

var sendalltosheet = async function(){
    let sentthrough = await cget('datasent');
    sentthrough = parseInt(sentthrough);
    //console.log('sending from ' + sentthrough);

    for (let k of await skeys()){
        if (k=='currid'){ continue; }

        let sid = parseInt(k);
        if (sid <= sentthrough){ continue; }

        let s = await sget(k);
        s['id'] = k;
        sendonetosheet(s);
        //sendonebyform(s);
        //testonetosheet(s);
    }
    let scurid = await sgetcurrid();
    cset('datasent', scurid);
    //console.log('... to ' + scurid);
}
