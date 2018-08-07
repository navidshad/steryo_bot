var show = function(userid){
    fn.userOper.setSection(userid, fn.mstr.archiveMusic.sections.s, true);
    var list = [];
    var back = fn.mstr.archiveMusic['back'];
    var mess = fn.mstr.archiveMusic.btns['singers'].lable;
    //get list
    fn.api.getsingers(40,1, (singers) => {
        singers.list.forEach(element => { list.push(element.name); });
        var remarkup = fn.generateKeyboard({'custom': true, 'grid':true, 'list': list, 'back':back}, false);
        global.fn.sendMessage(userid, mess, remarkup);
    });
}

var listingalbums = function(userid, singer){
    var list = [];
    var back = fn.mstr.archiveMusic.btns['singers'].back;
    var mess = singer;
    //get list
    fn.api.getalbums(singer, (albums) => {
        if(albums.length > 0){
            var section = fn.mstr.archiveMusic.sections.a + '-' + singer;
            fn.userOper.setSection(userid, section, true);
            albums.forEach(element => { list.push(element.name); });
            var remarkup = fn.generateKeyboard({'custom': true, 'grid':false, 'list': list, 'back':back}, false);
            global.fn.sendMessage(userid, mess, remarkup);
        }
        else global.fn.sendMessage(userid, 'هیچ آلبومی برای خواننده مورد نظر پیدا نشد.');

    });
}

var album = require('./album');

var routting = function(message, speratedSection){
    var text = message.text;
    //show singers list
    if (text === fn.mstr.archiveMusic.btns['singers'].lable || text === fn.mstr.archiveMusic.btns['singers'].back)
        show(message.from.id);

    //show singer's album
    else if (speratedSection[speratedSection.length-1] === fn.mstr.archiveMusic.sections.s)
        listingalbums(message.from.id, message.text);

    //show singer's album
    else if (speratedSection[speratedSection.length-1].includes(fn.mstr.archiveMusic.sections.a)){
        var singer = speratedSection[speratedSection.length-1].split('-')[1];
        var albumname = message.text;
        album.showalbum(message.from.id, albumname, singer);
    }
}

module.exports = { routting, album, }