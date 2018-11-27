// var getDailylimitation = async function(userid)
// {
//     var today = Date.today();
//     var limitnumb = 20;
//     var limitMess = 'تعداد دانلود روزانه شما به اتمام رسیده است.'

//     var limitOption = fn.getModuleData('userAbility', 'downloadlimit');
//     var limitMessOption = fn.getModuleData('userAbility', 'downloadlimitMess');

//     if(limitOption && !isNaN(parseInt(limitOption.value))) limitnumb = parseInt(limitOption.value);
//     if(limitMessOption.value) limitMess = limitMessOption.value;
    
//     console.log('limitnumb:', limitnumb);

//     var todayCounter = await fn.db.dailylimitation.findOne({'userid':userid, 'date': today}).exec().then();
//     if(!todayCounter)
//         todayCounter = await new fn.db.dailylimitation({'userid':userid, 'date': today}).save().then();

//     return {'todayCounter': todayCounter, 'limit': limitnumb, 'limitMess': limitMess}
// }

var showbyid = async function(userid, chatid, id, flag)
{
    var result = await fn.api.getmediabyid(id, userid).then();
    show(userid, chatid, result, flag);
}

var getview_main = function(liked, versions, mediaid, option={})
{
    var detailArr   = [];
    var queryTag = fn.mstr.userAbility.query;

    //versions
    //var versionrow = [];
    versions.forEach(version =>
    {
        if(version.name == option.version) return;
        var ver_fn = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['media'] + '-' + queryTag['version'] + '-' + version.name + '-' + mediaid;
        var type = `(${version.type} : ${version.name})`;
        var vername = (version.name != 'demo') ? `📥 دانلود کامل: ${type}` : `نسخه: ${type}`
        var btn = {'text': vername, 'callback_data': ver_fn}
        detailArr.push([btn]);
    });
    //detailArr.push(versionrow);

    //original version
    var orig_fn = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['media'] + '-' + queryTag['version'] + '-' + 'orginal' + '-' + mediaid;
    var orig_btn = {'text': 'کیفیت اصلی', 'callback_data': orig_fn}
    if(detailArr.length == 0) detailArr.push([orig_btn]);

    // like
    var tx_like = (liked) ? fn.mstr.archiveMusic['liked'] : fn.mstr.archiveMusic['disliked'];
    var fn_close    = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['media'] + '-' + queryTag['close'];
    var fn_like     = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['media'] + '-' + queryTag['like'] + '-' + mediaid;

    //like
    detailArr.push([
        {'text': '❌', 'callback_data': fn_close},
        {'text': tx_like, 'callback_data': fn_like}
        //{'text': 'اضافه به', 'callback_data': fn_addPlyls},
    ]);

    return detailArr;
}

var show = async function(userid, chatid, returnedmedia, flag)
{
    console.log('show media');
    var liked = (returnedmedia.liked) ? returnedmedia.liked : false;
    var media = returnedmedia.media;

    //create callback keyboard
    var detailArr   = [];
    var queryTag = fn.mstr.userAbility.query;
    //var fn_addPlyls = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['media'] + '-' + queryTag['addtoplaylist'] + '-' + media._id;
    //var fn_back     = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['media'] + '-' + queryTag['back'] + '-' + media._id;

    //description
    let description = '\n @' +  global.robot.username;
    
    // get copy right
    let copyRight = fn.getModuleData('userAbility','musicCaption');
    if(copyRight.value) copyRight = copyRight.value;
    
    // get media detail
    let mediaDetail = `🎼 ${media['title']}\n🎤 ${media['albumartist']}\n\n\n`;
    
    // combine caption
    let combineLength = mediaDetail.length + copyRight.length;
    
    if(combineLength >= 1024) description = mediaDetail;
    else {
        description = mediaDetail + copyRight;    
    }

    // version -----------------------------------------------------------
    var version = (flag.version) ? flag.version : 'demo';
    var hasVersion = false;
    var vDetail = {};
    media.versions.forEach(element => {
        if(element.name !== version) return;
        hasVersion = true;
        vDetail = element;
    });
    if(version == 'orginal') vDetail = {name:'orginal', type:'mp3', telegramid:media.telegramid};
    var sendType = (vDetail.type == 'ogg') ? 'voice' : 'sound';

    // markup
    if(flag.mode === 'main') detailArr = getview_main(liked, media.versions, media._id, {'version': vDetail.name});
    var markup = {'caption' : description, "reply_markup" : {"inline_keyboard" : detailArr}};

    //check daily limitation ---------------------------------------------
    let isLimited = await fn.m['tariff'].userView.isUserLimitted(userid);
    
    if(isLimited && version !== 'demo') {
        //console.log('user has been limited for today');
        fn.m['tariff'].userView.showLimiteMessage(userid);
        return;
    }
    
    // limitation counter
    if(version !== 'demo') fn.m['tariff'].userView.addToLimitationCounter(userid);
    // -------------------------------------------------------------------

    //send version
    if(hasVersion) global.fn.sendDocument(chatid, vDetail.telegramid, sendType, markup);
    //send orginal version
    else global.fn.sendDocument(chatid, media.telegramid, 'sound', markup);

    //track media
    var today = Date.today();
    new fn.db.mediaSearch({
        'userid': userid,
        'title' : media.title,
        'artist': media.albumartist,
        'date'  : today,
    }).save();
}

var close = function(query)
{
    //remove query message
    global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);
}

var like = async function(query, mediaid)
{
    var userid = query.from.id;
    var result = await fn.api.like(userid, 'media', mediaid).then();
    var detailArr = getview_main(result.liked, result.media.versions, mediaid);
    global.robot.bot.editMessageReplyMarkup({"inline_keyboard" : detailArr}, {chat_id: query.message.chat.id, message_id: query.message.message_id});
}

var addmediatoPlaylist = function(query, mediaid, listid)
{
    close(query);
    fn.api.getmediabyid(mediaid, (media) => {
        if(!media.title) {global.fn.sendMessage(query.from.id, fn.mstr.archiveMusic.mess['nomedia']); return;}
        var newmediadetail = {'title': media.title, 'singer': media.albumartist}
        //add to play list
        fn.api.editplaylist({'media': newmediadetail, 'id': listid}, (result) => {
            //get new playlists
            fn.api.getplaylists((newPlaylists) => { show(query.from.id, query.message.chat.id, mediaid, {'mode': 'addplaylist', 'playlists':newPlaylists}) });
        });
    });
}

var query = function(query, speratedQuery)
{
    var queryTag = fn.mstr.userAbility.query;
    var last = speratedQuery.length-1;

    // close
    if (speratedQuery[3] === queryTag['close'])
        close(query);

    // like
    else if (speratedQuery[3] === queryTag['like'])
        like(query, speratedQuery[last]);

    // switch version
    else if (speratedQuery[3] === queryTag['version'])
    {
        var versionName = speratedQuery[4];
        var mediaid = speratedQuery[last];

        close(query);
        showbyid(query.from.id, query.message.chat.id, mediaid, {'mode':'main', 'version': versionName});
    }

    // // show play lists
    // else if (speratedQuery[3] === queryTag['addtoplaylist'])
    // {
    //     fn.api.getplaylists((playlists) => {
    //         if(playlists.length == 0) {global.fn.sendMessage(query.from.id, fn.mstr.archiveMusic.mess['noplaylist']); return;}
    //         close(query);
    //         show(query.from.id, query.message.chat.id, speratedQuery[2], {'mode': 'addplaylist', 'playlists':playlists});
    //     });
    // }

    // // choose a play list
    // else if(speratedQuery[3] === queryTag['chooseplaylist'])
    //     addmediatoPlaylist(query, speratedQuery[3], speratedQuery[2]);

    // // back to main mode
    // else if (speratedQuery[3] === queryTag['back'])
    // {
    //     close(query);
    //     show(query.from.id, query.message.chat.id, speratedQuery[2], {'mode':'main'});
    // }
}

module.exports = {show, showbyid, query}
