const cons = document.querySelector('#cons');

var lineno = 1;
var lines = {};

cons.onkeydown = function(ev){
    if (ev.key == 'Backspace'){
        console.log('BS');
        let kpl = cons.value.split('\n');
        ll = kpl.slice(-1);
        if (ll == 'JS>'){
            ev.preventDefault();
        }
    }
}

cons.onkeypress = function(ev){
    if (ev.key == 'Enter'){
        lineno += 1;
    }
    let pos = cons.selectionStart;
    console.log('cokp : ' + ev.key + ':' + pos + ' cols:'+cons.cols+ ' rows: '+cons.rows+ '|lineno:'+lineno+'|');
    let kpl = cons.value.split('\n');
    console.log(kpl);
}

cons.onclick = function(ev){
    let pos = cons.selectionStart;
    console.log('cclk :' + pos);
}
