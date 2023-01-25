var c = new fabric.Canvas('c');
c.backgroundColor = 'lightgray';
c.renderAll();

var S = function(side){
    let ns = new fabric.Rect({
        width: side,
        height: side,
        top: 100,
        left: 100,
        fill: 'red',
        selectable: false,
        evented: false,
    })

    c.add(ns);
    c.renderAll();
    return ns;
}
