'use strict';

var Person = function(pid, lname, fname, grade){
    let self = this;
    self.pid = ko.observable(pid);
    self.fname = ko.observable(fname);
    self.lname = ko.observable(lname);
    self.linitial = ko.observable(lname[0]);
    self.grade = ko.observable(grade);
    self.stid = ko.observable(''); // student ID#
    self.active = ko.observable(true);

    self.clsactive = ko.pureComputed(function(){
        if (self.active()){
            return '';
        } else {
            let sg = vm.selectedgroup();
            if (!sg){
                return 'inactive';
            } else {
                let sgp = sg.people();
                if (sgp.includes(self)){
                    return 'inactivemember';
                } else {
                    return 'inactive';
                }
            }
        }
        // if all else fails
        return '';
    });

    self.checkorshowperson = async function(){
        // depending on context, either
        // set checkbox on this person's line
        //  (if editing group members, or session members)
        // show this person's data for editing
        //  (if not editing group members or session members)

        //console.log('COSP');
        let idbase;
        let is_sess = vm.showgroupsession();
        if (is_sess){
            idbase = '#gspid';
        } else {
            idbase = '#ngpid';
        }

        if (vm.showpersoncheckboxes()){
            //console.log('boxes');
            let g = vm.selectedgroup();
            if (g && !g.active()){ return; }

            let ngpid = idbase + self.pid();
            //console.log(ngpid);
            let cb = document.querySelector(ngpid);
            let change = false;
            if (cb.checked){
                cb.checked = false;
                change = true;
            } else if (self.active()) {
                // can uncheck inactive person,
                // but cannot check inactive person
                cb.checked = true;
                change = true;
            }
            if (!is_sess && change){
                vm.setchange();
            }
        } else {
            //console.log('NOboxes');
            await self.showperson();
        }
    }

    self.showperson = async function(){
        // load this person's data in to the form for editing

        vm.shownewperson(true);
        vm.personexists(true);
        if (vm.selectedgroup()){
            vm.selectedgroup().savecancel();
        }

        let dbp = await pget(self.pid());

        let formid = 'newperson_questions';
        let form = document.getElementById(formid);
        let fc = Array.from(form.children);
        //console.log('NPQ');
        for (let i=0; i<fc.length; i++){
            let div = fc[i];
            let qattr = div['data-qattr'];
            let elemid = formid + qattr;
            let elem = document.getElementById(elemid);
            let sa = person_answers[qattr];
            let dbpget;
            if (sa){
                dbpget = qattr + 'id';
            } else {
                dbpget = qattr + 'str';
            }
            let val = dbp[dbpget];
            //console.log(dbpget + ' '+ val);
            elem.value = val;
        }

        let xp = document.getElementById('xpersonid');
        xp.value = self.pid();

        let deac = document.getElementById('deactivate');
        let del = document.getElementById('delete');
        if (dbp.active===false){
            deac.innerHTML = 'Activate';
            del.style.visibility = 'visible';
        } else {
            deac.innerHTML = 'Deactivate';
            del.style.visibility = 'hidden';
        }
    }
}