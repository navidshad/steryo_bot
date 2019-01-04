var checkRoute = function(option){

    var access = fn.mstr.userAbility.access
    var btnsArr  = [
        // access[0].value, //archive
        // access[1].value, //favorites
        // access[2].value, //playlists
    ];

    fn.mstr.userAbility.access.map((item) => {
        btnsArr.push(item.value);
    });

    // add home playlists
    let playlists = fn.m.archiveMusic.playlists.getHomePlayLists();
    playlists.forEach(playlist => { btnsArr.push(playlist.name) });


    var result = {}
    //check text message
    if(option.text) btnsArr.forEach(btn => {
        if(option.text === btn && option.text !== fn.mstr.category['backtoParent'])
        {
            result.status = true;
            result.button = btn;
            result.routting = routting;
        }
    });

    //check seperate section
    if(option.speratedSection){
        option.speratedSection.forEach(section => {
            btnsArr.forEach(btn =>
            {
                if(section === btn){
                    result.status = true;
                    result.button = btn;
                    result.routting = routting;
                }
            });
        });
    }

    //return
    return result;
}

var getprivilegeStatus = function(moduleOption){
    var states = {};
    moduleOption.datas.forEach(element => {
        states[element.name] = element;
    });
    return states;
}

var getButtons = function ()
{
    var buttons = [];
    var mName = fn.mstr.userAbility['modulename'];
    var userAbilityModuleOption = fn.getModuleOption(mName, {'create':true, 'setting': {'name':mName, 'btn_order':1, 'datas':[], 'active': true, 'category': fn.mstr.category['maincategory']}}).option;
    var states = getprivilegeStatus(userAbilityModuleOption);
    
    fn.mstr.userAbility.access.map((item) => {
        if(item.name === 'search') return;
        else if(states[item.name] && states[item.name].key === true)
            buttons.push(item.value);
    });

    // add home playlists
    let playlists = fn.m.archiveMusic.playlists.getHomePlayLists();
    playlists.forEach(playlist => { buttons.push(playlist.name) });

    return buttons;
}

var routting = function(message, speratedSection, user)
{
    var mName = fn.mstr.userAbility['modulename'];
    var access = fn.mstr.userAbility['access'];
    var text = message.text;
    var last = speratedSection.length-1;
    var userAbilityModuleOption = fn.getModuleOption(mName, {'create':true, 'setting': {'name':mName, 'btn_order':1, 'datas':[], 'active': true, 'category': fn.mstr.category['maincategory']}}).option;
    var states = getprivilegeStatus(userAbilityModuleOption);
    var checkedRoute_text = checkRoute({'text': text});
    var checkedRoute_section = checkRoute({'speratedSection': speratedSection});
    var passToRoute = { 'cr_text': checkedRoute_text, 'cr_section': checkedRoute_section, 'states': states };

    //archive
    if(states['archive'].key && checkedRoute_text.button === states['archive'].value || checkedRoute_section.button === states['archive'].value)
        singers.routting(message, speratedSection, passToRoute, user);

    //playlist
    if(states['playlist'].key && checkedRoute_text.button === states['playlist'].value || checkedRoute_section.button === states['playlist'].value)
        playlist.routting(message, speratedSection, passToRoute, user);

    //favorites
    if(states['favorites'].key && checkedRoute_text.button === states['favorites'].value)
        favorite.show(message.from.id);

    // home playlist
    let playlists = fn.m.archiveMusic.playlists.getHomePlayLists();
    for (let i = 0; i < playlists.length; i++) 
    {
        const plDetail = playlists[i];
        if(text !== plDetail.name) continue;

        let plId = plDetail.value;
        playlist.showById(message.from.id, plId);
    }
}

var search = require('./user/search');
var singers = require('./user/archvie/singers');
var media = require('./user/archvie/media');
var playlist = require('./user/archvie/playlist');
var favorite = require('./user/favorites');

var query = function(query, speratedQuery, user)
{
    var last = speratedQuery.length-1;
    var queryTag = fn.mstr.userAbility.query;

    //album
    if(speratedQuery[2] === queryTag['album']) singers.album.query(query, speratedQuery, user);
    //playlist
    else if(speratedQuery[2] === queryTag['playlist']) playlist.query(query, speratedQuery, user);
    //favoritebag
    else if(speratedQuery[2] === queryTag['favorites']) favorite.query(query, speratedQuery, user);
    //media
    else if(speratedQuery[2] === queryTag['media']) media.query(query, speratedQuery, user);
    //search
    else if(speratedQuery[2] === queryTag['search']) search.query(query, speratedQuery, user);
}

//search
global.fn.eventEmitter.on('nothingtoroute', (message, speratedSection, user) =>
{
    var mName = 'userAbility';
    var userAbilityModuleOption = fn.getModuleOption(mName, {'create':true, 'setting': {'name':mName, 'btn_order':1, 'datas':[], 'active': true, 'category': fn.mstr.category['maincategory']}}).option;
    var states = getprivilegeStatus(userAbilityModuleOption);

    if(states['search'] && states['search'].key)  search.routting(message, speratedSection, user);
});

// get userid
global.fn.eventEmitter.on('commands', (message, speratedSection, user) =>
{
    if(message.text != '/userid') return;
    let newmsg = `🆔 ${message.from.id}`;
    
    global.fn.sendMessage(message.from.id, newmsg);
});

module.exports = { routting, checkRoute, getButtons, query, singers, search, media, playlist } 
