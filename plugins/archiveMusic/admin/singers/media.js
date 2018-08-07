var show = async function(chatid, id, flag)
{
    console.log('show media') 
    var result = await fn.api.getmediabyid(id).then();
    var media = result.media;

    //create callback keyboard
    var detailArr   = [];
    var qTag = fn.mstr.archiveMusic.qu;
    var fn_close    = qTag['archiveMusic'] + '-' + qTag['admin'] + '-' + qTag['a_media'] + '-' + qTag['close'];
    var fn_addPlyls = qTag['archiveMusic'] + '-' + qTag['admin'] + '-' + qTag['a_media'] + '-' + qTag['addtoplaylist'] + '-' + media._id;
    var fn_delete   = qTag['archiveMusic'] + '-' + qTag['admin'] + '-' + qTag['a_media'] + '-' + qTag['delete'] + '-' + media._id;
    var fn_back     = qTag['archiveMusic'] + '-' + qTag['admin'] + '-' + qTag['a_media'] + '-' + qTag['back'] + '-' + media._id;
    var fn_link     = qTag['archiveMusic'] + '-' + qTag['admin'] + '-' + qTag['a_media'] + '-' + qTag['link'] + '-' + media._id;

    
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
    
    else if (flag.mode === 'addplaylist'){
        flag.playlists.forEach(element => {
            //check if the play list was selected already
            var isselected = false;
            element.list.forEach(mediaItem => { if(mediaItem.title === media.title) isselected = true; }, this);
            
            fn_add = qTag['archiveMusic'] + '-' + qTag['admin'] + '-' + qTag['a_media'] + '-' + qTag['chooseplaylist'] + '-' + element._id + '-' + media._id;
            tx_text = (isselected) ? '✅ ' + element.name : element.name;
            detailArr.push([ {'text': tx_text, 'callback_data': fn_add} ]);
        });
        detailArr.push([
            {'text': '⤴️ ' + 'برگشت ', 'callback_data': fn_back},
            {'text': '❌', 'callback_data': fn_close},
        ]);
    }

    //send
    var description =  /* media.title + */ '\n @' +  global.robot.username;
    switch (media.type) {     
        case 'audio':
            global.robot.bot.sendAudio(chatid, media.telegramid, {'caption' : description, "reply_markup" : {"inline_keyboard" : detailArr}});        
            break;
        case 'video':
            global.robot.bot.sendVideo(chatid, media.telegramid, {'caption' : description, 'inline_keyboard': detailArr});                
            break;
    }
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
    
    if(!media.title) {global.fn.sendMessage(query.from.id, fn.mstr.archiveMusic.mess['nomedia']); return;}
    
    var newmediadetail = {'title': media.title, 'singer': media.albumartist}
    //add to play list
    fn.api.editplaylist({'media': newmediadetail, 'id': listid}, (result) => {
        //get new playlists
        fn.api.getplaylists((newPlaylists) => { 
            show(query.message.chat.id, mediaid, {'mode': 'addplaylist', 'playlists':newPlaylists}) 
        });
    });
}

var query = function(query, speratedQuery, user){
    var last = speratedQuery.length-1;
    var qTag = fn.mstr.archiveMusic.qu;

    //close
    if (speratedQuery[last] === qTag['close']) close(query);

    //show play lists
    else if (speratedQuery[last-1] === qTag['addtoplaylist']){
        fn.api.getplaylists((playlists) => {
            if(playlists.length == 0) {global.fn.sendMessage(query.from.id, fn.mstr.archiveMusic.mess['noplaylist']); return;}
            close(query);
            show(query.message.chat.id, speratedQuery[last], {'mode': 'addplaylist', 'playlists':playlists});
        });
    }

    //choose a play list
    else if(speratedQuery[last-2] === qTag['chooseplaylist']) 
        addmediatoPlaylist(query, speratedQuery[last], speratedQuery[last-1]);

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
        var startParam = `${fn.mstr.archiveMusic.linkRoutes.media}-${mediaid}`;
        var link = fn.getStartLink(startParam);
        fn.sendMessage(query.from.id, link);
    }
}

module.exports = { show, query }