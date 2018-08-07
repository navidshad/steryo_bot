var showalbum = async function(userid, name, singer)
{
    console.log('show album') 
    var album = await fn.api.getalbum(name, singer);

    if(!album.medias) {
        global.fn.sendMessage(userid, 'این آلبوم دیگر موجود نیست');
        return;
    }
    
    //create callback keyboard
    var detailArr   = [];
    var qTag = fn.mstr.archiveMusic.qu;
    var fn_close    = qTag['archiveMusic'] + '-' + qTag['admin'] + '-' + qTag['a_album'] + '-' + qTag['close'];
    var fn_edit     = qTag['archiveMusic'] + '-' + qTag['admin'] + '-' + qTag['a_album'] + '-' + qTag['edit'] + '-' + album.id;
    var fn_reload   = qTag['archiveMusic'] + '-' + qTag['admin'] + '-' + qTag['a_album'] + '-' + qTag['reload'] + '-' + album.id;
    var fn_delete   = qTag['archiveMusic'] + '-' + qTag['admin'] + '-' + qTag['a_album'] + '-' + qTag['delete'] + '-' + album.id;
    var fn_link     = qTag['archiveMusic'] + '-' + qTag['admin'] + '-' + qTag['a_album'] + '-' + qTag['link'] + '-' + album.id;
    
    //medias
    album.medias.forEach(element => {
        fn_ = qTag['archiveMusic'] + '-' + qTag['admin'] + '-' + qTag['a_album'] + '-' + qTag['showmedia'] + '-' + element._id;
        text = element.title;
        detailArr.push([{'text': text, 'callback_data': fn_}]);
    });

    //manage
    detailArr.push([
        {'text': '❌🗑', 'callback_data': fn_delete},
        {'text': '❌', 'callback_data': fn_close},
        {'text': '🔄', 'callback_data': fn_reload},
        //{'text': 'ویرایش', 'callback_data': fn_edit},            
    ]);

    //sharing
    detailArr.push([
        {'text': '🌐 لینک', 'callback_data': fn_link},           
    ]);
    
    //message
    var text = 'اطلاعات آلبوم' + '\n' +
    'ــــــــــــــــــــــــــــــــ' + '\n' +
    '⏺ ' + 'نام: ' + album.name + '\n' +
    '⏺ ' + 'خواننده: ' + album.singer + '\n' + 
    '⏺ ' + 'تراک: ' + album.medias.length + '\n' + '💽';
    var markup = {"reply_markup" : {"inline_keyboard" : detailArr}};
    global.fn.sendMessage(userid, text, markup);
}

var reloadAlbum = function(query, id){
    close(query);
    fn.api.getalbumbyid(id, (album) => {
        if(album.name) showalbum(query.from.id, album.name, album.singer);
        else global.fn.sendMessage(query.from.id, 'این آلبوم دیگر وجود ندارد');
    });
}

var close = function(query){
    //remove query message
    global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);
}

var deletealbum = function(query, id){
    close(query);
    fn.api.deletealbum(id, (body) => {
        global.fn.sendMessage(query.from.id, body.message + ' | ' + body.key);
    });
}

var media = require('./media');

var query = function(query, speratedQuery, user){
    var last = speratedQuery.length-1;
    var qTag = fn.mstr.archiveMusic.qu;

    //close
    if (speratedQuery[last] === qTag['close']) close(query);
    //show media
    else if(speratedQuery[last-1] === qTag['showmedia']) media.show(query.message.chat.id, speratedQuery[last], {'mode':'main'});
    //reload album
    else if (speratedQuery[last-1] === qTag['reload']) reloadAlbum(query, speratedQuery[last]);
    //delete album 
    else if (speratedQuery[last-1] === qTag['delete']) deletealbum(query, speratedQuery[last]);

    //get link 
    else if (speratedQuery[3] === qTag['link'])
    {
        var albumid = speratedQuery[last];
        var startParam = `${fn.mstr.archiveMusic.linkRoutes.album}-${albumid}`;
        var link = fn.getStartLink(startParam);
        fn.sendMessage(query.from.id, link);
    }
}

module.exports = {showalbum, media, query}