var sendPlayListTouser = function(userid, playlist)
{
    //create callback keyboard
    var detailArr   = [];
    var queryTag    = fn.mstr.userAbility.query;
    var fn_close    = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['playlist'] + '-' + queryTag['close'];
    var fn_getall   = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['playlist'] + '-' + queryTag['getallmedia'] + '-' + playlist.id;
    var fn_like     = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['playlist'] + '-' + queryTag['like'] + '-' + playlist.id;

    //medias
    playlist.list.forEach(element => {
        fn_ = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['playlist'] + '-' + queryTag['showmedia'] + '-' + element._id;
        text = `${element.albumartist}: ${element.titleIndex.ku_so}`;
        detailArr.push([{'text': text, 'callback_data': fn_}]);
    });

    //manage
    detailArr.push([
        {'text': '❌', 'callback_data': fn_close},
        {'text': 'دریافت همه' + ' 📥', 'callback_data': fn_getall}
    ]);

    var liked = playlist.liked;
    var tx_like = (liked) ? fn.mstr.archiveMusic['liked'] : fn.mstr.archiveMusic['disliked'];
    //push([ {'text': '❌', 'callback_data': fn_close}, ]);

    //message
    var text = 'اطلاعات لیست پخش' + '\n' +
    'ــــــــــــــــــــــــــــــــ' + '\n' +
    '⏺ ' + 'نام: ' + playlist.name + '\n' +
    '⏺ ' + 'تراک: ' + playlist.list.length + '\n' + '💽';
    var markup = {"reply_markup" : {"inline_keyboard" : detailArr}};
    global.fn.sendMessage(userid, text, markup);
    
    
    // analytic
    let pageName = playlist.name;
    let label = 'playlist';
    fn.m.analytic.trackPage(userid, pageName, label);
}

var showplaylist = async function(userid, name)
{
    console.log('show playlist')
    var playlist = await fn.api.getplaylist(name).then();
    if(!playlist.name) return;

    sendPlayListTouser(userid, playlist);
}

var showById = async function(userid, playlistid)
{
    console.log('showplaylist by id');
    var playlist = await fn.api.getplaylistByid(playlistid);

    if(!playlist.name) return;
    sendPlayListTouser(userid, playlist);
}

var getallmedia = function(query, id){
    fn.api.getplaylistByid(id, async (playlist) =>
    {
        for (let index = 0; index < playlist.list.length; index++) {
            const item = playlist.list[index];
            await media.showbyid(query.from.id, query.message.chat.id, item._id, {'mode':'main'});
        }
        
        // analytic
        let eventCategory = 'playlist';
        let eventAction = 'download all songs';
        let eventLabel = playlist.nam;
        fn.m.analytic.trackEvent(query.from.id, eventCategory, eventAction, eventLabel);
    });
}

var close = function(query){
    //remove query message
    global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);
}

var media = require('./media');

var show = async function(userid, text)
{
    var titles = [];

    // home playlists
    let homePlaylists = fn.m.archiveMusic.playlists.getHomePlayLists();
    let isInHome = function(id)
    {
        let isInHomeKey = false;
        homePlaylists.forEach(item => {
            if(item.value == id) isInHomeKey = true;
        })
        
        return isInHomeKey;
    }

    //get playlists
    var playlists = await fn.api.getplaylists().then();
    playlists.map(item => { 
        if(!isInHome(item._id)) titles.push(item.name);
    });

    //show list
    var mess = text;
    var back = fn.str['backToMenu'];
    var markup = fn.generateKeyboard({'custom':true, 'grid':true, 'list': titles, 'back':back}, false);
    global.fn.sendMessage(userid, mess, markup);
    fn.userOper.setSection(userid, mess, true);
}

var routting = function(message, speratedSection, passToRoute, user)
{
    var mName = fn.mstr.userAbility['modulename'];
    var text = message.text;
    var last = speratedSection.length-1;

    //show list
    if(text == passToRoute.states['playlist']['value'])
        show(message.from.id, text);

    //show playlist
    else if (speratedSection[last] == passToRoute.states['playlist']['value'])
        showplaylist(message.from.id, text);
}

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

var like = async function(query, mediaid)
{
    var userid = query.from.id;
    var result = await fn.api.like(userid, 'media', mediaid).then();
    var detailArr = getview_main(result.key, mediaid);
    global.robot.bot.editMessageReplyMarkup({"inline_keyboard" : detailArr}, {chat_id: query.message.chat.id, message_id: query.message.message_id});
}

module.exports = { routting , query, showById }
