'use strict';

var sheetsurl = 'https://script.google.com/macros/s/AKfycbyZ-qmvpF2iu8Gn4js_3HaiM36l537DEZPhk7BzYjC1TjMWcHg/exec'


function urlencode (str) {
    return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/%20/g, '+');
}

function addnv(name, value) {
    return urlencode(name) + '=' + urlencode(value);
}

var hts = function(o){
    let ss = [];
    for (let k of Object.keys(o)){
        let s = addnv(k, o[k]);
        ss.push(s);
    }
    return ss.join('&');
}

var sendonetosheet = async function(o){
    let d = hts(o);
    fetch(sheetsurl+'?'+d)
    .then(function(response){ console.log('responded'); working.pop(); })
    .catch(function(error){ console.log('err ' + error); })
}

var sendalltosheet = async function(){
    let sentthrough = await cget('datasent');
    sentthrough = parseInt(sentthrough);
    console.log('sending from ' + sentthrough);

    for (let k of await skeys()){
        if (k=='currid'){ continue; }

        let sid = parseInt(k);
        if (sid <= sentthrough){ continue; }

        let s = await sget(k);
        s['id'] = k;
        sendonetosheet(s);
    }
    let scurid = await sgetcurrid();
    cset('datasent', scurid);
    console.log('... to ' + scurid);
}
