var sendPlayListTouser = function(userid, playlist)
{
    //create callback keyboard
    var detailArr   = [];
    var queryTag    = fn.mstr.userAbility.query;
    var fn_close    = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['playlist'] + '-' + queryTag['close'];
    var fn_getall   = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['playlist'] + '-' + queryTag['getallmedia'] + '-' + playlist.id;
    var fn_like     = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['playlist'] + '-' + queryTag['like'] + '-' + playlist.id;

    //medias
    let totalItems = playlist.list.length;
    playlist.list.forEach((element, i) => {
        let number = totalItems - i;
        let fn_ = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['playlist'] + '-' + queryTag['showmedia'] + '-' + element._id;
        let title = (element.titleIndex.ku_so) ? element.titleIndex.ku_so : element.title;
        let text = `${number}. ${element.albumartist}: ${title}`;
        detailArr.push([{'text': text, 'callback_data': fn_}]);
    });

    //manage
    detailArr.push([
        {'text': '❌', 'callback_data': fn_close},
        {'text': 'دریافت همه' + ' 📥', 'callback_data': fn_getall}
    ]);

    var liked = playlist.liked;
    var tx_like = (liked) ? fn.mstr.arc['liked'] : fn.mstr.arc['disliked'];
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
            await global.fn.sleep(500);
            const item = playlist.list[index];
            media.showbyid(query.from.id, query.message.chat.id, item._id, {'mode':'main', 'eventAction':'playlist'});
        }
        
        // analytic
        let eventCategory = 'playlist';
        let eventAction = 'download all songs';
        let eventLabel = playlist.name;
        fn.m.analytic.trackEvent(query.from.id, eventCategory, eventAction, eventLabel);
    });
}

var close = function(query){
    //remove query message
    global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);
}

var media = require('./media');

async function show(userid, page, text)
{
    var titles = [];
    let mStr = fn.mstr[moduleName];

    // home playlists
    let homePlaylists = fn.m.arc.playlists.getHomePlayLists();
    let isInHome = function(id)
    {
        let isInHomeKey = false;
        homePlaylists.forEach(item => {
            if(item.value == id) isInHomeKey = true;
        })
        
        return isInHomeKey;
    }

    //get playlists
    var result = await fn.api.getplaylists(page).then();
    result.list.map(item => { 
        if(!isInHome(item._id)) titles.push(item.name);
    });

    let navigator = [];
    if(result.totalpage > result.current) titles.push(mStr.btns_user.nextPage);
    if(result.current > 1) titles.push(mStr.btns_user.backPage);
    //if(navigator.length) titles.push(navigator);

    //show list
    var mess = text == null ? page : `${text} ${page}`;
    var back = fn.str['backToMenu'];
    var markup = fn.generateKeyboard({'custom':true, 'grid':true, 'list': titles, 'back':back}, false);
    global.fn.sendMessage(userid, mess, markup);

    fn.userOper.setSection(userid, text, true, 
        () => {
            // page section
            let pageSection = `${result.totalpage}-${result.current}`;
            fn.userOper.setSection(userid, pageSection, true);
        });
}   

function navigatePage(userid, navigate, pageDetail, playlistSection)
{
    let total = parseInt(pageDetail.split('-')[0]);
    let current = parseInt(pageDetail.split('-')[1]);

    let next = current + navigate;

    if(next <= total && next > 0) 
        show(userid, next, playlistSection);
}

let moduleName = '';

var routting = function(message, speratedSection, passToRoute, user, mName)
{
    var text = message.text;
    var last = speratedSection.length-1;
    moduleName = mName;
    let mStr = fn.mstr[moduleName];
    let userid = message.from.id;
    let playlistSection = passToRoute.states['playlist']['value'];

    // show list
    if(text == playlistSection)
        show(userid, 1, playlistSection);

    // navigate
    // next page
    else if (text == mStr.btns_user.nextPage) navigatePage(userid, 1, speratedSection[last], playlistSection);
    // back page
    else if (text == mStr.btns_user.backPage) navigatePage(userid, -1, speratedSection[last], playlistSection);

    // show playlist
    else showplaylist(userid, text);
}

var query = function(query, speratedQuery, user)
{
    var last = speratedQuery.length-1;
    var queryTag = fn.mstr.userAbility.query;

    //close
    if (speratedQuery[3] === queryTag['close']) close(query);
    //show media
    else if(speratedQuery[3] === queryTag['showmedia']) 
      media.showbyid(query.from.id, query.message.chat.id, speratedQuery[last], {'mode':'main', 'eventAction':'playlist'});
    //get all media
    else if (speratedQuery[3] === queryTag['getallmedia']) 
      getallmedia(query, speratedQuery[last]);

}

var like = async function(query, mediaid)
{
    var userid = query.from.id;
    var result = await fn.api.like(userid, 'media', mediaid).then();
    var detailArr = getview_main(result.key, mediaid);
    global.robot.bot.editMessageReplyMarkup({"inline_keyboard" : detailArr}, {chat_id: query.message.chat.id, message_id: query.message.message_id});
}

module.exports = { routting , query, showById }
