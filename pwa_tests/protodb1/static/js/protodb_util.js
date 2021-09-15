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
