var show = async function(chatid, id, flag)
{
    console.log('show media') 
    var result = await fn.api.getmediabyid(id).then();
    var media = result.media;
    let mStr = fn.mstr[moduleName];

    //create callback keyboard
    var detailArr   = [];
    var qTag = fn.mstr.arc.qu;
    var fn_close    = qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_media'] + '-' + qTag['close'];
    var fn_addPlyls = qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_media'] + '-' + qTag['addtoplaylist'] + '-' + media._id;
    var fn_delete   = qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_media'] + '-' + qTag['delete'] + '-' + media._id;
    var fn_back     = qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_media'] + '-' + qTag['back'] + '-' + media._id;
    var fn_link     = qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_media'] + '-' + qTag['link'] + '-' + media._id;

    
    //manage
    if(flag.mode === 'main')
    {
        detailArr.push([
            {'text': '❌🗑', 'callback_data': fn_delete},
            {'text': '❌', 'callback_data': fn_close},
            {'text': 'اضافه به', 'callback_data': fn_addPlyls},
        ]);
        
        //sharing
        detailArr.push([
            {'text': '🌐 لینک', 'callback_data': fn_link},           
        ]);
    }
    
    else if (flag.mode === 'addplaylist')
    {
        flag.playlists.list.forEach(element => {
            //check if the play list was selected already
            var isselected = false;
            element.list.forEach(mediaItem => { if(mediaItem.title === media.title) isselected = true; }, this);
            
            let fn_add = qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_media'] + '-' + qTag['chooseplaylist'] + '-' + element._id + '-' + media._id;
            let tx_text = (isselected) ? '✅ ' + element.name : element.name;
            detailArr.push([ {'text': tx_text, 'callback_data': fn_add} ]);
        });

        // navigator
        let totalPage = flag.playlists.totalpage;
        let current = flag.playlists.current;

        let fn_nextPage = qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_media'] + '-' + qTag['navigateplaylist'] + '-' + qTag['next'] + '-' + current + '-' + media._id;
        let fn_backPage = qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_media'] + '-' + qTag['navigateplaylist'] + '-' + qTag['back'] + '-' + current + '-' + media._id;
        let tx_nextPage = mStr.btns_user.nextPage;
        let tx_backPage = mStr.btns_user.backPage;
        
        console.log(fn_back.length);
        
        let navigator = [];
        if(totalPage > current) navigator.push({'text': tx_nextPage, 'callback_data': fn_nextPage});
        if(current > 1) navigator.push({'text': tx_backPage, 'callback_data': fn_backPage});
        if(navigator.length) detailArr.push(navigator);

        detailArr.push([
            {'text': '⤴️ ' + 'برگشت ', 'callback_data': fn_back},
            {'text': '❌', 'callback_data': fn_close},
        ]);
        
        console.log(detailArr);
    }

    // version -----------------------------------------------------------
    var version = '96';
    var hasVersion = false;
    var vDetail = {};
    media.versions.forEach(element => {
        if(element.name !== version) return;
        hasVersion = true;
        vDetail = element;
    });
    var sendType = (vDetail.type == 'ogg') ? 'voice' : 'sound';
    
    //send
    var description =  /* media.title + */ '\n @' +  global.robot.username;
    var markup = {'caption' : description, "reply_markup" : {"inline_keyboard" : detailArr}};
    // switch (media.type) {     
    //     case 'audio':
    //         global.robot.bot.sendAudio(chatid, resID, {'caption' : description, "reply_markup" : {"inline_keyboard" : detailArr}});        
    //         break;
    //     case 'video':
    //         global.robot.bot.sendVideo(chatid, media.telegramid, {'caption' : description, 'inline_keyboard': detailArr});                
    //         break;
    // }
    
    //send version
    if(hasVersion) global.fn.sendDocument(chatid, vDetail.telegramid, sendType, markup);
    //send orginal version
    else global.fn.sendDocument(chatid, media.telegramid, 'sound', markup);
}

var close = function(query){
    //remove query message
    global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);
}

var deletmedia = function(query, id){
    close(query);
    fn.api.deletemedia(id, (body) => {
        global.fn.sendMessage(query.from.id, body.message + ' | ' + body.key);
    });
}

var addmediatoPlaylist = async function(query, mediaid, listid)
{
    close(query);
    var result = await fn.api.getmediabyid(mediaid).then();
    var media = result.media;
    
    if(!media.title) {global.fn.sendMessage(query.from.id, fn.mstr.arc.mess['nomedia']); return;}
    
    var newmediadetail = {'title': media.title, 'singer': media.albumartist}
    //add to play list
    fn.api.editplaylist({'media': newmediadetail, 'id': listid}, (result) => {
        //get new playlists
        fn.api.getplaylists(1, (newPlaylists) => { 
            show(query.message.chat.id, mediaid, {'mode': 'addplaylist', 'playlists':newPlaylists}) 
        });
    });
}

async function showPlaylistView(query, mediaid, page)
{
    let result = await fn.api.getplaylists(page).then();
    
    if(result.list.length == 0) 
    {
        global.fn.sendMessage(query.from.id, fn.mstr.arc.mess['noplaylist']); 
        return;
    }

    close(query);
    show(query.message.chat.id, mediaid, {'mode': 'addplaylist', 'playlists':result});
}

let moduleName  = '';
var query = async function(query, speratedQuery, user, mName)
{
    moduleName = mName;
    var last = speratedQuery.length-1;
    var qTag = fn.mstr[moduleName].qu;
    
    console.log(speratedQuery);

    //close
    if (speratedQuery[last] === qTag['close']) close(query);

    //show play lists
    else if (speratedQuery[last-1] === qTag['addtoplaylist'])
        showPlaylistView(query, speratedQuery[last], 1);

    //choose a play list
    else if(speratedQuery[last-2] === qTag['chooseplaylist']) 
        addmediatoPlaylist(query, speratedQuery[last], speratedQuery[last-1]);

    //navigate playlist
    else if (speratedQuery[last-3] === qTag['navigateplaylist'])
    {
        let navigate = parseInt(speratedQuery[last-2]);
        let current = parseInt(speratedQuery[last-1]);
        let nextPage = current + navigate;
        showPlaylistView(query, speratedQuery[last], nextPage);
    }

    //back to main mode
    else if (speratedQuery[last-1] === qTag['back']) {
        close(query);
        show(query.message.chat.id, speratedQuery[last], {'mode':'main'});
    }

    //delete media
    else if(speratedQuery[last-1] === qTag['delete']) deletmedia(query, speratedQuery[last]);
    
    //get link 
    else if (speratedQuery[3] === qTag['link'])
    {
        var mediaid = speratedQuery[last];
        var startParam = `${fn.mstr.arc.linkRoutes.media}-${mediaid}`;
        var link = fn.getStartLink(startParam);
        fn.sendMessage(query.from.id, link);
    }
}

module.exports = { show, query }