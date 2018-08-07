var checkQuery = function(option){

    var btnsArr  = [ 
        fn.mstr.archiveMusic.qu['archiveMusic']
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
    var qTag = fn.mstr.archiveMusic.qu;

    //remove query message
    //global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);

    if(speratedQuery[1] === qTag['admin'])
    {
        //admin album
        if(speratedQuery[2] === qTag['a_album'])
            fn.m.archiveMusic.singers.album.query(query, speratedQuery, user);
        //admin music
        else if(speratedQuery[2] === qTag['a_media'])
            fn.m.archiveMusic.singers.album.media.query(query, speratedQuery, user);
        //admin playlist
        else if(speratedQuery[2] === qTag['a_playlist'])
            fn.m.archiveMusic.playlists.query(query, speratedQuery, user);
    }
}

module.exports = { checkQuery }