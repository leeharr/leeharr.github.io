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
        this.s.fill = color;
        c.renderAll();
    }
}
