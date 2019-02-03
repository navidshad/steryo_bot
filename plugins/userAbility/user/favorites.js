var show = async function(userid, page=1, mode='new', option={})
{
    console.log('show favbag') 
    //get items
    var result = await fn.api.getfavorites(userid, 'media', 10, page);
    var items = result.list;

    //create callback keyboard
    var detailArr   = [];
    var queryTag    = fn.mstr.userAbility.query;
    var fn_close    = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['favorites'] + '-' + queryTag['close'];
    var fn_getall   = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['favorites'] + '-' + queryTag['getallmedia'];
    
    //items
    var type = queryTag['media'];
    items.forEach(item => {
        var fn_ = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['favorites'] + '-' + type + '-' + item._id;
        var text = item.title;
        detailArr.push([{'text': text, 'callback_data': fn_}]);
    });

    //navigator
    var current = parseInt(result.current);
    var pages = parseInt(result.pages);
    var next_fn   = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['favorites'] + '-' + queryTag['page'] + '-' + (current+1);
    var back_fn   = queryTag['userAbility'] + '-' + queryTag['user'] + '-' + queryTag['favorites'] + '-' + queryTag['page'] + '-' + (current-1);
    
    var n_row = [];
    if(pages > current) n_row.push({'text': '⬅️', 'callback_data': next_fn});
    n_row.push({'text': '❌', 'callback_data': fn_close});
    if(current > 1) n_row.push({'text': '➡️', 'callback_data': back_fn});
    detailArr.push(n_row);

    //manage
    // detailArr.push([
    //     {'text': '❌', 'callback_data': fn_close},   
    //     //{'text': 'دریافت همه' + ' 📥', 'callback_data': fn_getall}    
    // ]);
    
    //message
    var text = 'لیست علاقمندی های شما' + '\n' +
    'ــــــــــــــــــــــــــــــــ' + '\n' +
    '⏺ ' + 'تراک: ' + items.length + '\n' + '💽';

    var markup = {"reply_markup" : {"inline_keyboard" : detailArr}};
    
    if(mode == 'new') global.fn.sendMessage(userid, text, markup);
    else if(mode == 'edit') global.robot.bot.editMessageReplyMarkup({"inline_keyboard" : detailArr}, option);
    
    // analytic
    let pageName = 'favorites';
    let label = userid;
    fn.m.analytic.trackPage(userid, pageName, label);
}

var close = function(query){
    //remove query message
    global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);
}

var media = require('./archvie/media');

var query = function(query, speratedQuery, user)
{
    var last = speratedQuery.length-1;
    var queryTag = fn.mstr.userAbility.query;

    //close
    if (speratedQuery[3] === queryTag['close']) close(query);
    //show media
    else if(speratedQuery[3] === queryTag['media']) media.showbyid(query.from.id, query.message.chat.id, speratedQuery[last], {'mode':'main'});
    //get all media
    else if (speratedQuery[3] === queryTag['getallmedia']) getallmedia(query, speratedQuery[last]);
    
    // navigate
    else if (speratedQuery[3] === queryTag['page'])
    {
        var page = parseInt(speratedQuery[last]);
        var option = {chat_id: query.message.chat.id, message_id: query.message.message_id};
        show(user.userid, page, 'edit', option);
    }
}

module.exports = { show, query }