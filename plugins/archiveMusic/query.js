var checkQuery = function(option){

    var btnsArr  = [ 
        fn.mstr.arc.qu['arc']
    ];

    var result = {}
    //checl seperate section
    if(option.speratedSection){
        option.speratedSection.forEach(section => {
            btnsArr.forEach(btn => 
            { 
                if(section === btn){
                    result.status = true; 
                    result.button = btn;
                    result.routting = am_q_routting;
                }
            });
        });
    }

    //return
    return result;
}

var am_q_routting = function(query, speratedQuery, user)
{
    var last = speratedQuery.length-1;
    var qTag = fn.mstr.arc.qu;

    //remove query message
    //global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);

    if(speratedQuery[1] === qTag['admin'])
    {
        //admin album
        if(speratedQuery[2] === qTag['a_album'])
            fn.m.arc.singers.album.query(query, speratedQuery, user);
        //admin music
        else if(speratedQuery[2] === qTag['a_media'])
            fn.m.arc.singers.album.media.query(query, speratedQuery, user);
        //admin playlist
        else if(speratedQuery[2] === qTag['a_playlist'])
            fn.m.arc.playlists.query(query, speratedQuery, user);
    }
}

module.exports = { checkQuery }