var checkRoute = function(option){

    var btnsArr  = getButton();

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

    //checl seperate section
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

var getButton = function(){
    return [];
}

var archive = require('./user/archvie/singers');
var search  = require('./user/search');

var routting = function(message, speratedSection, user){
    var text = message.text;
    
    //go Archive view
    if(text === fn.mstr.archiveMusic.menu['archive'].lable || text === fn.mstr.archiveMusic.btns['singers'].back || speratedSection[1] === fn.mstr.archiveMusic.section.s) 
        archive.routting(message, speratedSection);
}

module.exports = { checkRoute, routting }