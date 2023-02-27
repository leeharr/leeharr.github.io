const cons = document.querySelector('#cons');

cons.onkeypress = function(ev){
    let pos = cons.selectionStart;
    console.log('cokp : ' + ev.key + ':' + pos);
}

cons.onclick = function(ev){
    let pos = cons.selectionStart;
    console.log('cclk :' + pos);
}
