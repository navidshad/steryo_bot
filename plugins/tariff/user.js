var checkRoute = function(option)
{
    var mName   = option.mName;
    var btnsArr  = fn.convertObjectToArray(fn.mstr[mName].btns_user,{});

    var result = {}
    //check text message
    if(option.text) btnsArr.forEach(btn => { 
        if(option.text === btn) 
        {
            result.status = true; 
            result.button = btn;
            result.routting = routting;
        }
    });

    //check seperate section
    if(option.speratedSection){
        option.speratedSection.forEach(section => {
            btnsArr.forEach(btn => 
            { 
                if(section === btn){
                    result.status = true; 
                    result.button = btn;
                    result.routting = routting;
                }
            });
        });
    }

    //return
    return result;
}

var getButtons = function (mName){
    let buttons  = fn.convertObjectToArray(fn.mstr[mName].btns_user,{});
    return buttons;
}

var routting = function(message, speratedSection, user, mName)
{
    var last = speratedSection.length-1;
    var btns = fn.mstr[mName].btns_user;
    var userid = message.from.id;
    
    //
    if (message.text === btns['viewTariff'])
        fn.m[mName].userView.showUserTariff(userid);

}

module.exports = { routting, checkRoute, getButtons }