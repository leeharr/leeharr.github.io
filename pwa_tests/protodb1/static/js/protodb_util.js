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
    console.log('CK OTH');
    for (let i=0; i<answers.length; i++){
        let ans = answers[i];
        console.log('ck '+ans);
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

var name_initials = function(name){
    let names = name.split(' ');
    let inits = '';
    for (n of names){
        if (n.includes('-')){
            let nsi = [];
            ns = n.split('-');
            for (nn of ns){
                nsi.push(nn[0]);
            }
            inits += nsi.join('-');
        } else {
            inits += n[0];
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
