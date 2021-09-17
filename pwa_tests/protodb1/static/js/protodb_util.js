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
    console.log(ansl);
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
        if (othery(ans)){
            return true;
        }
    }
    return false;
}
