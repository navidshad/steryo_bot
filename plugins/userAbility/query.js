checkQuery = function(option) 
{
    var btnsArr  = [ 
        fn.mstr.userAbility.query['userAbility']
    ];

    const result = {}
    //checl seperate section
    if(option.speratedSection){
        option.speratedSection.forEach(section => {
            btnsArr.forEach(btn => 
            { 
                if(section === btn){
                    result.status = true; 
                    result.button = btn;
                    result.routting = ua_q_routting;
                }
            });
        });
    }

    //return
    return result;
}

var ua_q_routting = function(query, speratedQuery, user, mName)
{
    var last = speratedQuery.length-1;
    var queryTag = fn.mstr.userAbility.query;
    
    //remove message
    if(speratedQuery[1] !== queryTag['user']) global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);
    
    //switch key
    if(speratedQuery[2] === queryTag['switchkey']) {
        var moduleIndex = speratedQuery[last];
        fn.m.userAbility.editUserAbility(user, {'switch': true, 'index': moduleIndex});
    }

    //got to setting
    else if (speratedQuery[2] === queryTag['settings'])
        fn.m[mName].settings.query(query, speratedQuery, user, mName);

    //user
    else if (speratedQuery[1] === queryTag['user'])
        fn.m.userAbility.user.query(query, speratedQuery, user);
}

module.exports = { checkQuery }