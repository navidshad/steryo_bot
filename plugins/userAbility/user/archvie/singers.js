var show = async function(userid, states){
    fn.userOper.setSection(userid, fn.mstr.userAbility.sections.s, true);
    var list = [];
    var back = fn.str['backToMenu'];
    var mess = fn.mstr.archiveMusic.btns['singers'].lable;

    //get list
    var singers = await fn.api.getsingers(40,1).then();
    if(singers.length == 0) return;

    
    singers.list.forEach(element => { list.push(element.name); });
    var remarkup = fn.generateKeyboard({'custom': true, 'grid':false, 'list': list, 'back':back}, false);
    var nSection = states['archive'].value + '/' + fn.mstr.userAbility.sections.s;
    
    global.fn.sendMessage(userid, mess, remarkup);
    fn.userOper.setSection(userid, nSection, true);
}

var listingalbums = async function(userid, singer){
    var list = [];
    var back = fn.str['backToMenu'];
    var mess = singer;
    //get list
    fn.api.getalbums(singer, (albums) => {
        if(albums.length > 0){
            albums.forEach(element => { list.push(element.name); });
            var section = fn.mstr.userAbility.sections.a + '-' + singer;
            var remarkup = fn.generateKeyboard({'custom': true, 'grid':false, 'list': list, 'back':back}, false);
            global.fn.sendMessage(userid, mess, remarkup);
            fn.userOper.setSection(userid, section, true);
        }
        else global.fn.sendMessage(userid, 'هیچ آلبومی برای خواننده مورد نظر پیدا نشد.');
    });
}

var album = require('./album');

var routting = function(message, speratedSection, passToRoute, user){
    
    var text = message.text;

    //show singers list
    if (passToRoute.cr_text.button === passToRoute.states['archive'].value)
        show(message.from.id, passToRoute.states);

    //show singer's album
    else if (speratedSection[speratedSection.length-1] === fn.mstr.userAbility.sections.s)
        listingalbums(message.from.id, message.text);

    //show singer's album
    else if (speratedSection[speratedSection.length-1].includes(fn.mstr.userAbility.sections.a)){
        var singer = speratedSection[speratedSection.length-1].split('-')[1];
        var albumname = message.text;
        album.showalbum(message.from.id, albumname, singer);
    }
}

module.exports = { routting, album }