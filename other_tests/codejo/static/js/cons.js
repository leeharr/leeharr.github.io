const cons = document.querySelector('#cons');

var lineno = 1;

cons.onkeypress = function(ev){
    if (ev.key == 'Enter'){
        lineno += 1;
    }
    let pos = cons.selectionStart;
    console.log('cokp : ' + ev.key + ':' + pos + '|lineno:'+lineno+'|');
}

cons.onclick = function(ev){
    let pos = cons.selectionStart;
    console.log('cclk :' + pos);
}
