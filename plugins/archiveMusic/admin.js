var name = 'archiveMusic';

var checkRoute = function(option){

    var btnsArr  = [
        fn.mstr.archiveMusic['name'],
        fn.mstr.archiveMusic['back']
    ];

    var result = {}
    //check text message
    if(option.text) btnsArr.forEach(btn => {
        if(option.text === btn)
        {
            result.status = true;
            result.button = btn;
            result.routting = routting;
        }
    });

    //checl seperate section
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

 var show = function(userid, injectedtext){
    fn.userOper.setSection(userid, fn.mstr.archiveMusic['name'], true);
    var list = [
        [fn.mstr.archiveMusic.btns['singers'].lable, fn.mstr.archiveMusic.btns['addmusic']],
        [fn.mstr.archiveMusic.btns['playlists'].lable]
    ];
    var back = fn.str.goToAdmin['back'];
    var mess = (injectedtext) ? injectedtext : fn.mstr.archiveMusic['name'];
    global.fn.sendMessage(userid, mess, fn.generateKeyboard({'custom': true, 'grid':false, 'list': list, 'back':back}, false));
}

var upload = require('./upload');
var singers = require('./admin/singers/singers');
var playlists = require('./admin/playlist');
var query = require('./query');
//var user = require('./user');

//events
require('./events')();

var routting = function(message, speratedSection){
    var text = message.text;
    var last = speratedSection.length-1;

    //show music root
    if(text === fn.mstr.archiveMusic['name'] || text === fn.mstr.archiveMusic['back'])
        show(message.from.id);

    //addmusic
    else if(text === fn.mstr.archiveMusic.btns['addmusic']) upload.addmode(message);

    //singers
    else if (text === fn.mstr.archiveMusic.btns['singers'].lable || text === fn.mstr.archiveMusic.btns['singers'].back || speratedSection[3] === fn.mstr.archiveMusic.sections.s)
        singers.routting(message, speratedSection);

    //play lists
    else if (text === fn.mstr.archiveMusic.btns['playlists'].lable || text === fn.mstr.archiveMusic.btns['playlists'].back ||  speratedSection[3] === fn.mstr.archiveMusic.btns['playlists'].lable)
        playlists.routting(message, speratedSection);
}

module.exports = { name, checkRoute, query, routting, show, upload, singers, playlists }

global.fn.eventEmitter.on('commands', async (message, speratedSection, user) =>
{
    var text = message.text;
    if(text !== '/getcount') return;

    var wordcount = await global.fn.db.word.count({}).exec().then();
    var usercount = await global.fn.db.user.count({}).exec().then();
    var mediaCount = await global.fn.db.media.count().exec().then();
    var useRange = await global.fn.api.getStatistics('usersrange', 1).then();

    var rangeDetail = '';
    useRange.list.forEach(r => { rangeDetail += '✴️ ' + r._id + ' | ' + r.count + '\n'; });


    var mess = '🎹 ' + 'جستجو ها: ' + wordcount;
    mess += '\n' + '👥 ' + 'کاربران: ' + usercount;
    mess += '\n' + '🎶 ' + 'ترانه ها: ' + mediaCount;
    mess += '\n\n' + '📊 ' + 'طیف استفاده کاربران' + '\n' + rangeDetail;
    mess += '\n 📉';
    global.fn.sendMessage(message.from.id, mess);
});
