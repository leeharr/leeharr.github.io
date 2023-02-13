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

class XY{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}
var Pos = function(x, y){
    return new XY(x, y);
}

class Sq{
    constructor(side, pos){
        let ns = new fabric.Rect({
            width: side,
            height: side,
            top: pos.y,
            left: pos.x,
            fill: 'red',
            selectable: false,
            evented: false,
        });
        this.s = ns;
        c.add(ns);
        c.renderAll();
    }

    setx(x){
        this.s.left = x;
        c.renderAll();
    }

    sety(y){
        this.s.top = y;
        c.renderAll();
    }

    setc(color){
        this.s.set('fill', color);
        c.renderAll();
    }
}

var Square = function(side, pos){
    if (!pos){ pos = Pos(100,100); }
    let ns = new fabric.Rect({
        width: side,
        height: side,
        top: pos.y,
        left: pos.x,
        fill: 'red',
        selectable: false,
        evented: false,
    });
    c.add(ns);
    return ns;
}


uploop = function(){
    c.renderAll();
}
setInterval(uploop, 33);

py = jspython.jsPython()

pycode = `
def foo(x):
    return x * x
`
py.evaluate(pycode)
