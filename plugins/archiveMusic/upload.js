var checkUpload = function(option){

    var btnsArr  = [ 
        fn.mstr.archiveMusic.btns['addmusic'],
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

var addmode = function(message){
    console.log('music add mode');
    fn.userOper.setSection(message.from.id, fn.mstr.archiveMusic.btns['addmusic'], true);
    var remarkup = fn.generateKeyboard({section:fn.mstr.archiveMusic['back']}, true);
    global.fn.sendMessage(message.from.id, fn.mstr.archiveMusic.btns['addmusic'], remarkup);
}

var storefile = function(message, speratedSection){
    //audio
    if(message.audio && message.audio.mime_type === "audio/mpeg") 
        storeAudioFile(message);
    //video
    else if(message.video){
        resourceid = message.video.file_id;
        //fn.m.post.editpost(resId, {'videoid': resourceid}, message.from.id);                        
    } 
}

var storeAudioFile = async function(message)
{
    var tempPath = global.config.temp;
    var resourceid = message.audio.file_id;
    var name = (message.audio.title) ? message.audio.title : resourceid;
    name += '.mp3';
    tempPath = fn.path.join(tempPath, name);

    console.log('ensure the temp path exists')
    // ensure the temp path exists
    await fn.fse.ensureDir(global.config.temp).then();

    console.log('save file to temp');
    // save file to temp
    fn.saveTelegramFile(resourceid, tempPath, async (id, path) => 
    {
        console.log('start to get media detail');
        //start to get media detail
        var detail = await global.fn.musicmetadata.get(path).then();
        detail.type = 'audio';
        detail.telegramid = id;

        //send to api AND user
        console.log('send to api AND user');
    	var result = await global.fn.api.sendmedia(detail);
        sendSavedMediaDetailToUser(result, detail, message.from.id); 

        //report activity of upload
        console.log('report activity of upload');
        var successful = (result.done) ? true : false;
        var reportDetail = {
            type: 'upload',
            valuetype: (successful) ? 'successful' : 'unsuccessful',
            value: 1,
        }
        global.fn.api.reportActivity(message.from.id, reportDetail);

        //remove temp file
        fn.removeFile(path);
    });
}

var sendSavedMediaDetailToUser = function(body, detail, userid)
{
    var detail = body.detail;
    var mess = (body.done) ? '✅ ' + 'مشخصات آهنگ ذخیره شده' : '❌ ' + body.error;
    mess += '\n';
    
    mess += '\n' + '<code>' + '🏷 ' + 'title: ' + '</code>' + detail.title;
    mess += '\n' + '<code>' + '💽 ' + 'album: ' + '</code>' + detail.album;
    mess += '\n' + '<code>' + '🕺 ' + 'albumartist: ' + '</code>' + detail.albumartist;
    mess += '\n' + '<code>' + '📆 ' + 'year: ' + '</code>' + detail.year;
    mess += '\n' + '<code>' + '⛩ ' + 'genre: ' + '</code>' + detail.genre;
    mess += '\n' + '<code>' + '📀 ' + 'disk: ' + '</code>' + JSON.stringify(detail.disk);
    mess += '\n' + '<code>' + '🎵' + 'track: ' + '</code>' + JSON.stringify(detail.track);
    mess += '\n' + '<code>' + '🔖' + 'type: ' + '</code>' + detail.type;
    mess += '\n' + '<code>' + '🎞' + 'duration: ' + '</code>' + detail.duration;
    mess += '\n' + '<code>' + '🆔' + '</code>' + detail.telegramid;
    
    // link
    var startParam = `${fn.mstr.archiveMusic.linkRoutes.media}-${detail._id}`;
    var link = fn.getStartLink(startParam);
    mess += '\n\n' + '🌐 ' + link;

    fn.userOper.setSection(userid, fn.mstr.archiveMusic.btns['addmusic'], true);
    var remarkup = fn.generateKeyboard({section:fn.mstr.archiveMusic['back']}, true);
    remarkup.parse_mode = 'HTML';

    global.fn.sendMessage(userid, mess, remarkup);
}

var routting = function(message, speratedSection){
    var last = speratedSection.length-1;

    //upload mode
    if(speratedSection[last] === fn.mstr.archiveMusic.btns['addmusic'])
        storefile(message, speratedSection);
}

module.exports = { routting, checkUpload, addmode, storefile, storeAudioFile, sendSavedMediaDetailToUser }