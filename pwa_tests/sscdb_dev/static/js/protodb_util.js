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
var otherval = function(answers){
    for (let i=0; i<answers.length; i++){
        let ans = answers[i];
        if (othery(ans)){
            return ans.substr(7);
        }
    }
    return '';
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

var allsame = function(arr){
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
var oneunique = function(arr){
    let uniques = allunique(arr);
    if (uniques.length==1){ return uniques[0]; }
}
var allunique = function(arr){
    let sarr = arr.slice();
    let uniques = [];
    while (sarr.length>0){
        let v = sarr.pop();
        if (!sarr.includes(v)){
            uniques.push(v);
        } else {
            sarr = sarr.filter(function(i){ return i!=v; })
        }
    }
    return uniques;
}

var removeAllChildNodes = function(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

var __next_objid=1;
function objectId(obj) {
    if (obj==null) return null;
    if (obj.__obj_id==null) obj.__obj_id=__next_objid++;
    return obj.__obj_id;
}

var scrolltop = function(){
    window.scrollTo(0, 0);
}
var scrollto = function(elem){
    elem.scrollIntoView();
}

var get2digit = function(val){
    return val.toString().length === 1 ? "0" + val : val;
}

var unsend_all = async function(){
    let ks = await skeys();
    let us = 0;
    let ki = 0;
    for (let k of ks){
        if (k=='currid'){continue;}
        let s = await sget(k);
        s.sent = false;
        await sset(k, s);
    }
    cset('datasent', 0);
}

var checkdupstudent_ssc = async function(p, gradechk=false){
    // return true if duplicate detected, false otherwise.
    // gradechk: includes grade in the detection algorithm,
    //      otherwise, does not depend on grade match for dup

    let ks = await pkeys();
    for (let k of ks){
        if (k == 'currid'){ continue; }
        let pe = await pget(k); // existing person

        if (p.uuid == pe.uuid){ continue; }

        if (p.fname==pe.fname &&
            p.lname==pe.lname &&
            p.dob==pe.dob){
//                 console.log(p.fname+'='+pe.fname);
//                 console.log(p.lname+'='+pe.lname);
//                 console.log(p.dob+'='+pe.dob);
//                 console.log(p.gradestr+'='+pe.gradestr);

                if (gradechk){
                    return p.gradestr==pe.gradestr;
                }

                return true;
        }
    }
    return false;
}

var fillfortest = async function(n){
    for (i; i++; i<n){
        let pid = await pgetnextid();
        let fname = 'Fname'+i;
        let lname = 'Lname'+i;
        let grstr = '6';
        let p = {};
        p.lname = lname;
        p.lnamestr = lname;
        p.fname = fname;
        p.fnamestr = fname;
        g.gradeid = '0';
        g.grstr = grstr;
    }
}

var purge_old_sessions = async function(){
    let purged = await cget('purged');
    if (purged && purged >= '2023-09-14'){
        return;
    }

    let sessions = await skeys();
    for (let sk of sessions){
        if (sk == 'currid'){ continue; }
        let s = await sget(sk);
        let cid = s.sesname;
        let parts = cid.split('-');
        console.log(parts);
        let thisone = false;
        for (let p of parts){
            if (p=='2022'){
                thisone = true;
                break;
            } else if (p=='2023'){
                thisone = true;
                continue
            } else if (thisone && (p=='1'||p=='2'||p=='3'||p=='4'||p=='5'||p=='6')){
                thisone = true;
                break
            } else {
                thisone = false;
            }
        }

        if (thisone){
            console.log('THIS');
        }
    }

    let dt = new Date();
    let dstr = [
            dt.getFullYear(),
            ('0' + (d.getMonth() + 1)).slice(-2),
            ('0' + d.getDate()).slice(-2)
        ].join('-');
    await cset('purged', dstr);
}
