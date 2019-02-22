let homePlaylists = 'homePlaylists';

function getHomePlayLists()
{
    let list = [];

    let homePlaylistsOption = fn.getModuleOption('homePlaylists', {create: true});
    homePlaylistsOption.option.datas.reverse().forEach(playlist => {
        if(playlist.key) list.push(playlist);
    })

    return list;
}

var create = function(userid, name)
{
    //check string array
    if(fn.checkValidMessage(name)) { global.fn.sendMessage(userid, fn.mstr.arc.mess['chooseothernameforlist']); return; }
    //send to api
    fn.api.sendplaylist({'name': name}, (body) => {
        if(body.key) show(userid, 1, fn.str['seccess']);
        else global.fn.sendMessage(userid, fn.mstr.arc.mess['chooseothernameforlist']);
    })
}

// var getplaylist = function(userid, name)
// {
//     fn.api.getplaylist(name, (playlist) => {
//         if (!playlist.name) { global.fn.sendMessage(userid, fn.mstr.arc.mess['deletedplaylist']); return; }
//         showplaylist(userid, playlist);
//     });
// }

var showplaylist = function(userid, playlist)
{
    //create callback keyboard
    var detailArr   = [];
    var qTag = fn.mstr.arc.qu;
    var fn_name     = qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_playlist'] + '-' + qTag['name'] + '-' + playlist.id;
    var fn_close    = qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_playlist'] + '-' + qTag['close'];
    var fn_reload   = qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_playlist'] + '-' + qTag['reload'] + '-' + playlist.id;
    var fn_delete   = qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_playlist'] + '-' + qTag['delete'] + '-' + playlist.id;
    var fn_link     = qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_playlist'] + '-' + qTag['link'] + '-' + playlist.id;
    var fn_settoHome= qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_playlist'] + '-' + qTag['settoHome'] + '-' + playlist.id;
    
    console.log(fn_name, '\n', fn_close, '\n', fn_reload, '\n', fn_delete, '\n', fn_link, '\n', fn_settoHome);
    
    // set to home
    let sth = 'صفحه اصلی';
    let setToHomeData = fn.getModuleData(homePlaylists, playlist.name);
    let setToHome_tx = (setToHomeData.key) ? `${sth} ✅` : sth;

    //manage
    detailArr.push([
        {'text': '❌🗑', 'callback_data': fn_delete},
        {'text': '❌', 'callback_data': fn_close},
        {'text': '🔄', 'callback_data': fn_reload},
        {'text': 'نام', 'callback_data': fn_name},            
    ]);

    //sharing
    detailArr.push([
        {'text': '🌐 لینک', 'callback_data': fn_link},
        {'text': setToHome_tx, 'callback_data': fn_settoHome},
    ]);

    //medias
    playlist.list.forEach((element, i) => {
        var fn_show = qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_playlist'] + '-' + qTag['showmedia'] + '-' + element._id;
        var fn_deleteSong = qTag['arc'] + '-' + qTag['admin'] + '-' + qTag['a_playlist'] + '-' + qTag['deletefromlist'] + '-' + playlist.id + '-' + i;
        var tx_title = element.title;
        detailArr.push([
            {'text': tx_title, 'callback_data': fn_show},
            {'text': '❌', 'callback_data': fn_deleteSong}
        ].reverse());
    });

    //message
    var text = 'اطلاعات لیست پخش' + '\n' +
    'ــــــــــــــــــــــــــــــــ' + '\n' +
    '⏺ ' + 'نام: ' + playlist.name + '\n' + 
    '⏺ ' + 'تراک: ' + playlist.list.length + '\n' + '💽';
    '⚠️ ' + 'توجه: ' + 'فعلا تعداد تراک ها نباید بیشتر از 15 باشد' + '\n' + '💽';
    var markup = {"reply_markup" : {"inline_keyboard" : detailArr}};
    global.fn.sendMessage(userid, text, markup);
}

var close = function(query)
{
    //remove query message
    global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);
}

var editname = async function(message, id)
{
    let newName = message.text;

    // edit playlist in home
    let pl = await fn.api.getplaylistByid(id);
    let name = pl.name;
    let setToHomeData = fn.getModuleData(homePlaylists, name);
    setToHomeData.name = newName;
    setToHomeData.value = id;
    fn.putDatasToModuleOption(homePlaylists, [setToHomeData]);

    // edit playlist
    fn.api.editplaylist({'name': newName, 'id':id}, (result) =>
    {
        if(!result.key) {
            global.fn.sendMessage(message.from.id, fn.mstr.arc.mess['chooseothernameforlist']); 
            return;
        }

        showplaylist(message.from.id, result.playlist);
        show(message.from.id, 1, 'انجام شد.');
    });
}

var deleteplaylist = function(query, id)
{
    close(query);
    fn.api.removeplaylist(id, (body) => {
        global.fn.sendMessage(query.from.id, body.message + ' | ' + body.key);
        //show(query.from.id, body.message + ' | ' + body.key)
    });
}

var reloadplaylist = function(query, pid)
{
    close(query);
    var userid = query.from.id;
    fn.api.getplaylistByid(pid, (playlist) => {
        if (!playlist.name) { global.fn.sendMessage(userid, fn.mstr.arc.mess['deletedplaylist']); return; }
        showplaylist(query.from.id, playlist);
    });
}

var show = async function(userid, page, injectedtext)
{
    var list = [ [fn.mstr.arc.btns['addlist'], fn.mstr.arc['back']].reverse() ];
    var mess = (injectedtext) ? injectedtext : fn.mstr.arc.btns['playlists'].lable;
    let playlistSection = fn.mstr.arc.btns['playlists'].lable;
    let mStr = fn.mstr[moduleName];

    //get play lists
    var result = await fn.api.getplaylists(page).then();
    result.list.map(item => { 
        list.push([item.name]);
    });

    let navigator = [];
    if(result.totalpage > result.current) navigator.push(mStr.btns_user.nextPage);
    if(result.current > 1) navigator.push(mStr.btns_user.backPage);
    if(navigator.length) list.push(navigator);
    
    var markup = fn.generateKeyboard({'custom': true, 'grid':false, 'list': list, 'back': null}, false);
    global.fn.sendMessage(userid, mess, markup);

    fn.userOper.setSection(userid, playlistSection, true, 
        () => {
            //page section
            let pageSection = `${result.totalpage}-${result.current}`;
            fn.userOper.setSection(userid, pageSection, true);
        });
}

function navigatePage(userid, navigate, pageDetail)
{
    let total = parseInt(pageDetail.split('-')[0]);
    let current = parseInt(pageDetail.split('-')[1]);

    let next = current + navigate;

    if(next <= total && next > 0) 
        show(userid, next);
}

let moduleName  = '';
var routting = async function(message, speratedSection, user, mName)
{
    var text = message.text;
    var last = speratedSection.length-1;
    let userid = message.from.id;
    var qTag = fn.mstr.arc.qu;
    moduleName = mName;
    let mStr = fn.mstr[moduleName];
    
    //show playlists
    if(text === fn.mstr.arc.btns['playlists'].lable || text === fn.mstr.arc.btns['playlists'].back) 
        show(userid, 1);

    // navigate
    // next page
    else if (text == mStr.btns_user.nextPage) navigatePage(userid, 1, speratedSection[last]);
    // back page
    else if (text == mStr.btns_user.backPage) navigatePage(userid, -1, speratedSection[last]);

    //create a play list 
    else if (text === fn.mstr.arc.btns['addlist']){
        var mess = fn.mstr.arc.mess['addlist'];
        fn.userOper.setSection(userid, fn.mstr.arc.btns['addlist'], true);
        global.fn.sendMessage(userid, mess, fn.generateKeyboard({'section': fn.mstr.arc.btns['playlists'].back}, true));
    }
    else if (speratedSection[last] === fn.mstr.arc.btns['addlist']) create(userid, text);

    //edit name
    else if (speratedSection[last-1] === fn.mstr.arc.mess['e_listname'])
        editname(message, speratedSection[last]);

    //choose a play list 
    else getplaylist(userid, text);
}

var query = async function(query, speratedQuery)
{
    var last = speratedQuery.length-1;
    var qTag = fn.mstr.arc.qu;

    //close
    if (speratedQuery[last] === qTag['close']) 
        close(query);

    //reload playlist
    else if (speratedQuery[3] === qTag['reload']) 
        reloadplaylist(query, speratedQuery[4]);

    //edit name
    else if (speratedQuery[3] === qTag['name']){
        //e_listname
        close(query);
        var mess = fn.mstr.arc.mess['e_listname'];
        var newsection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name']  + '/' + fn.mstr.arc['name'] + '/' + fn.mstr.arc.btns['playlists'].lable + '/' + mess + '/' + speratedQuery[last];
        fn.userOper.setSection(query.from.id, newsection, true);
        global.fn.sendMessage(query.from.id, mess, fn.generateKeyboard({'section': fn.mstr.arc.btns['playlists'].back}, true));
    }
    //delete playlist 
    else if (speratedQuery[3] === qTag['delete']) 
        deleteplaylist(query, speratedQuery[last]);

    //deletefromlist
    else if (speratedQuery[3] === qTag['deletefromlist'])
    {
        close(query);
        var mediaIndex = speratedQuery[last];
        var listid  = speratedQuery[last-1];
        
        var playlist = await fn.api.getplaylistByid(id);
        var mediaid = playlist.list[mediaIndex]._id;
        var result = await fn.api.getmediabyid(mediaid).then();
        var media = result.media;

        if(!media.title) {
            global.fn.sendMessage(query.from.id, fn.mstr.arc.mess['nomedia']); 
            return;
        }
        var newmediadetail = {'title': media.title, 'singer': media.albumartist}
        //add to play list
        fn.api.editplaylist({'media': newmediadetail, 'id': listid}, (result) => {
            //show again
            showplaylist(query.from.id, result.playlist);
        });
    }

    //show track
    else if (speratedQuery[3] === qTag['showmedia']){
        fn.m.arc.singers.album.media.show(query.message.chat.id, speratedQuery[last], {'mode': 'main'})
    }

    //get link 
    else if (speratedQuery[3] === qTag['link'])
    {
        var playlistid = speratedQuery[last];
        var startParam = `${fn.mstr.arc.linkRoutes.playlist}-${playlistid}`;
        var link = fn.getStartLink(startParam);
        fn.sendMessage(query.from.id, link);
    }

    //set to home
    else if (speratedQuery[3] === qTag['settoHome'])
    {
        close(query);

        let id = speratedQuery[last];

        // et playlist
        let pl = await fn.api.getplaylistByid(id);

        let name = pl.name;
        setToHome(name, id, 1);
        // let setToHomeData = fn.getModuleData(homePlaylists, name);
        // setToHomeData.key = !setToHomeData.key;
        // setToHomeData.name = name;
        // setToHomeData.value = id;
        // setToHomeData.more = [1];

        // fn.putDatasToModuleOption(homePlaylists, [setToHomeData]);
        showplaylist(query.from.id, pl);
    }
}

function setToHome(name, id, order)
{
    let setToHomeData = fn.getModuleData(homePlaylists, name);
    
    setToHomeData.key = !setToHomeData.key;
    setToHomeData.name = name || setToHomeData.name;
    setToHomeData.value = id || setToHomeData.value;
    setToHomeData.more = [order];

    fn.putDatasToModuleOption(homePlaylists, [setToHomeData]);
}

module.exports = { routting, query, getHomePlayLists }