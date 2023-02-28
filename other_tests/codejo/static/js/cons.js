const cons = document.querySelector('#cons');

var lineno = 1;
var lines = {};

cons.onkeypress = function(ev){
    if (ev.key == 'Enter'){
        lineno += 1;
    }
    let pos = cons.selectionStart;
    console.log('cokp : ' + ev.key + ':' + pos + ' cols:'+cons.cols+ ' rows: '+cons.rows+ '|lineno:'+lineno+'|');
    console.log(cons.value);
}

cons.onclick = function(ev){
    let pos = cons.selectionStart;
    console.log('cclk :' + pos);
}
