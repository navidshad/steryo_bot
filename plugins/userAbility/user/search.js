var saveSearch = function(userid, word, count)
{
    if(word.length > 100) return;
    var today = Date.today();
    var newSearchedWord = new fn.db.word({
        'userid': userid,
        'word': word,
        'date': today,
        'count': count,
    }).save();
    
    // analytic
    let eventCategory = 'search';
    let eventAction = 'media';
    let eventLabel = word;
    let eventValue = count;
    fn.m.analytic.trackEvent(userid, eventCategory, eventAction, eventLabel, eventValue);
}

var showResult_keyboard = function(userid, result, mess)
{
    var list = [];
    var back = fn.str['backToMenu'];
    
    //listing
    result.medias.forEach(element => {
        var item = element.albumartist + ': ' + element.title;
        list.push(item);
    });

    //send
    var remarkup = fn.generateKeyboard({'custom': true, 'grid':true, 'list': list, 'back':back}, false);
    global.fn.sendMessage(userid, mess, remarkup);
    fn.userOper.setSection(userid, fn.mstr.arc.search, true);
}

var showResult_inlineKeyboard = function(userid, result, mess)
{
    var qt = fn.mstr.userAbility.query;
    var detailArr   = [];

    // listing
    result.medias.forEach(media =>
    {
        var fn_btn   = qt['userAbility'] + '-' + qt['user'] + '-' + qt['search'] + '-' + qt['showmedia'] + '-' + media._id;
        var title = media.title;
        if(media.titleIndex.ku_so) title = media.titleIndex.ku_so;
        var text = media.albumartist + ': ' + title;
        detailArr.push([{'text': text, 'callback_data': fn_btn}]);
    });

    //navigator

    // send
    var markup = {"reply_markup" : {"inline_keyboard" : detailArr}};
    global.fn.sendMessage(userid, mess, markup);
}

var search = async function(userid, word, user)
{
    var mess = 'نتیجه جستجو برای واژه "' + word + '"';

    // get result from api
    var result = await fn.api.search(word);

    // save word
    saveSearch(userid, word, result.medias.length);

    //no result
    if(result.medias.length == 0) {
        var customMessData = fn.getModuleData('userAbility','notFound');
        mess = (customMessData) ? customMessData.value : 'هیچ آهنگی پیدا نشد';
        global.fn.commands.backToMainMenu(userid, user, mess);
        return;
    }

    // check result mode
    var resultMode = fn.getModuleData('userAbility','searchresultmode').value;

    mess += `\n🎶 ${result.medias.length} ترانه \n.`;

    // show result
    if(resultMode == 'keyboard') showResult_keyboard(userid, result, mess);
    else if (resultMode == 'inlinekeyboard') showResult_inlineKeyboard(userid, result, mess);
}

var showResultItem = async function(userid, chatid, text)
{
    mediadetail = text.split(': ');

    var mediaName = '';
    var splitCount = mediadetail.length-1;
    mediadetail.forEach((part, i) => {
        if(i === 0) return;
        mediaName += part;
        if(i < splitCount) mediaName += ': '
    });

    console.log(userid, mediaName);

    //get media
    var result = await fn.api.getmedia(mediaName, mediadetail[0], userid).then();
    if(!result.media) { search(userid, text); return; }
    else fn.m.userAbility.user.media.show(userid, chatid, result, {'mode':'main'});
}

var routting = function(message, speratedSection, user)
{
    //choose searched item
    if(speratedSection[1] === fn.mstr.arc.search) showResultItem(message.from.id, message.chat.id, message.text);
    //search
    else search(message.from.id, message.text, user);
}

var media = require('./archvie/media');
var query = function(query, speratedQuery, user)
{
    var last = speratedQuery.length-1;
    var queryTag = fn.mstr.userAbility.query;

    //close
    if (speratedQuery[3] === queryTag['close']) close(query);
    //show media
    else if(speratedQuery[3] === queryTag['showmedia']) media.showbyid(query.from.id, query.message.chat.id, speratedQuery[last], {'mode':'main'});
    //get all media
    //else if (speratedQuery[3] === queryTag['getallmedia']) getallmedia(query, speratedQuery[last]);

}

module.exports = { routting, query, search }
