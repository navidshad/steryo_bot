var checkQuery = function(option)
{
    var mName = option.mName;
    var btnsArr  = [ 
        fn.mstr[mName].query[mName],
    ];

    var result = {}
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

var routting = function(query, speratedQuery, user, mName)
{
    console.log('tariff query routting');
    var last = speratedQuery.length-1;
    var queryTag = fn.mstr[mName].query;
    
    // remove query message
    global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);

    // admin settings
    if(speratedQuery[1] === queryTag['admin'] && speratedQuery[2] === queryTag['settings'])
        fn.m[mName].settings.query(query, speratedQuery, user, mName);
        
    // tariff
    else if(speratedQuery[2] == queryTag['tariff'])
    {
        let mess = fn.mstr[mName].mess['editTariff'];
        let tariffid = speratedQuery[last];
        let EdittingParameter = speratedQuery[last-1];
        
        var nSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr[mName]['name'] + '/' + mess + '/' + EdittingParameter + '/' + tariffid;
        var back = fn.mstr[mName]['back'];

        var markup = fn.generateKeyboard({'section':back}, true);

        global.robot.bot.sendMessage(query.from.id, mess + `\n ${EdittingParameter}`, markup);
        fn.userOper.setSection(query.from.id, nSection, false);
    }
    
    // user
    else if (speratedQuery[1] == queryTag['user'])
        fn.m[mName].userView.query(query, speratedQuery, user, mName);
}

module.exports = { routting, checkQuery }