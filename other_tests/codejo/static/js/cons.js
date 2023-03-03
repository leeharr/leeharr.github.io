const cons = document.querySelector('#cons');

var lineno = 1;
var lines = {};

const PROMPT = 'JS> ';

cons.onkeydown = function(ev){
    if (ev.key == 'Backspace'){
        console.log('BS');
        let kpl = cons.value.split('\n');
        ll = kpl.slice(-1);
        if (ll == PROMPT){
            ev.preventDefault();
        }
    }
}

cons.onkeypress = function(ev){
    let kpl = cons.value.split('\n');
    if (ev.key == 'Enter'){
        lineno += 1;
        cons.value += '\n' + PROMPT;
        ev.preventDefault();
        let last = kpl.slice(-1);
        console.log('LAST:'+last+'|'+last.length);
        let cmd = last.slice(4);
        console.log('CMD:'+cmd+'|'+cmd.length);
        runcmd(cmd);
        return
    }
    let pos = cons.selectionStart;
    console.log('cokp : ' + ev.key + ':' + pos + ' cols:'+cons.cols+ ' rows: '+cons.rows+ '|lineno:'+lineno+'|');
    console.log(kpl);
}

cons.onclick = function(ev){
    let pos = cons.selectionStart;
    console.log('cclk :' + pos);
}

var runcmd = function(cmd){
    console.log('RUN: ' + cmd);
}
