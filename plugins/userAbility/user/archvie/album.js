var sendAlbumTouser = function(userid, album)
{
    if(!album.medias) {
        global.fn.sendMessage(userid, 'این آلبوم دیگر موجود نیست');
        return;
    }
    //create callback keyboard
    var detailArr   = [];
    var queryTag    = fn.mstr.userAbility.query;
    var fn_close    = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['album'] + '-' + queryTag['close'];
    var fn_getall   = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['album'] + '-' + queryTag['getallmedia'] + '-' + album.id;
    
    //medias
    album.medias.forEach(element => {
        var fn_ = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['album'] + '-' + queryTag['showmedia'] + '-' + element._id;
        var b_txt = element.title;
        detailArr.push([{'text': b_txt, 'callback_data': fn_}]);
    });

    //manage
    detailArr.push([
        {'text': '❌', 'callback_data': fn_close},   
        {'text': 'دریافت همه' + ' 📥', 'callback_data': fn_getall}    
    ]);
    
    //message
    var text = 'اطلاعات آلبوم' + '\n' +
    'ــــــــــــــــــــــــــــــــ' + '\n' +
    '⏺ ' + 'نام: ' + album.name + '\n' +
    '⏺ ' + 'خواننده: ' + album.singer + '\n' + 
    '⏺ ' + 'تراک: ' + album.medias.length + '\n' + '💽';
    var markup = {"reply_markup" : {"inline_keyboard" : detailArr}};
    global.fn.sendMessage(userid, text, markup);
    
    // analytic
    let pageName = album.name;
    let label = 'album';
    fn.m.analytic.trackPage(userid, pageName, label);
}

var showalbum = async function(userid, name, singer){
    console.log('show album') 
    var album = await fn.api.getalbum(name, singer);
    sendAlbumTouser(userid, album);
}

var showById = async function(userid, albumid)
{
    console.log('showalbum by id');
    var album = await fn.api.getalbumbyid(albumid);
    sendAlbumTouser(userid, album);
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

var getallmedia = function(query, id)
{
    fn.api.getalbumbyid(id, async (album) => 
    {
        for (let index = 0; index < album.medias.length; index++) {
            const item = album.medias[index];
            await media.show(query.from.id, query.message.chat.id, item, {'mode':'main'});
        }
        
        // analytic
        let eventCategory = 'album';
        let eventAction = 'download all songs';
        let eventLabel = album.name;
        fn.m.analytic.trackEvent(query.from.id, eventCategory, eventAction, eventLabel);
    });
}

var media = require('./media');
var query = function(query, speratedQuery, user)
{
    var last = speratedQuery.length-1;
    var queryTag = fn.mstr.userAbility.query;

    //close
    if (speratedQuery[3] === queryTag['close']) close(query);
    //show media
    else if(speratedQuery[3] === queryTag['showmedia']) media.showbyid(query.from.id, query.message.chat.id, speratedQuery[last], {'mode':'main'});
    //get all media
    else if (speratedQuery[3] === queryTag['getallmedia']) getallmedia(query, speratedQuery[last]);
}

module.exports = { showalbum, media, query, showById }