var asyncForEach = async function(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

var selectoptiontext = function(s, oval){
    for (i=0; i<s.options.length; i++){
        let o = s.options[i];
        if (o.value == oval){
            return o.text;
        }
    }
}

var othery = function(txt){
    let ansl = txt.toLowerCase();
    //console.log(ansl);
    if (ansl.startsWith('other')){
        return true;
    } else {
        return false;
    }
}
var checkforother = function(answers){
    //console.log('CK OTH');
    for (let i=0; i<answers.length; i++){
        let ans = answers[i];
        if (othery(ans)){
            return true;
        }
    }
    return false;
}

var reset_session_questions = function(){
    let form = document.getElementById('newsession_questions');
    //console.log('form reset '+form);
    Array.from(form.children).forEach(function(div, i, arr){
        let qattr = div['data-qattr'];
        //console.log('qattr : '+qattr);
        let sel = div.children[1];
        let val = sel.value;
        //console.log('   val : '+val);
        let f = sel['data-reset']
        if (f){
            f(sel);
        } else {
            sel.value = '';
        }
    });
    let smr = document.getElementById('session_members_reminder');
    smr.classList.remove('qdiverr');
}

var name_initials = function(name, numi){
    if (!numi){ numi=[] };
    numi.push(1,1,1);

    let names = name.split(' ');
    let inits = '';
    let ni;
    let ii;
    for (n of names){
        if (n.includes('-')){
            let nsi = [];
            let ns = n.split('-');
            for (nn of ns){
                ni = numi.shift();
                ii = nn.slice(0, ni);
                nsi.push(ii);
            }
            inits += nsi.join('-');
        } else {
            ni = numi.shift();
            ii = n.slice(0, ni);
            inits += ii;
        }
    }
    return inits;
}

var graden = function(gr){
    let gi = {"Pre-K": 'P',
                "Kinder": 'K',
                "1st": '1',
                "2nd": '2',
                "3rd": '3',
                "4th": '4',
                "5th": '5',
                "6th": '6',
                "7th": '7',
                "8th": '8',
                "Freshman": '9',
                "Sophomore": '10',
                "Junior": '11',
                "Senior": '12'};
    let n = gi[gr];
    return n;
}
var name_grader = function(inits, gr){
    let g = graden(gr);
    let i = inits + ' ' + g;
    return i;
}

var allsame = function (arr){
    for (var i=0; i<arr.length-1; i++) {
        if (arr[i] != arr[i+1]) {
            return false;
        }
    }
    return true;
}
var alldiff = function(arr){
    let sarr = arr.slice();
    sarr.sort();
    for (var i=0; i<arr.length-1; i++){
        if (sarr[i] == sarr[i+1]){ return false; }
    }
    return true;
}
