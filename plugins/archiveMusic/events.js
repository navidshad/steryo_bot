module.exports = function()
{
    //show a playlist from a link
    global.fn.eventEmitter.on('commands', (message, user) =>
    {
        console.log('get command');
        var startParam_playlist = global.fn.mstr.archiveMusic.linkRoutes.playlist;
        var startParam_album 		= global.fn.mstr.archiveMusic.linkRoutes.album;
				var startParam_media 		= global.fn.mstr.archiveMusic.linkRoutes.media;
				var startParam_search		= global.fn.mstr.archiveMusic.linkRoutes.search;

        var text = message.text;
        var userid = message.from.id;

        // return
        var notSkips = [startParam_playlist, startParam_album, startParam_media, startParam_search];
        var skipKey = true;
        notSkips.forEach( el => { if(text.startsWith(`/start ${el}-`)) skipKey = false; });
        if(skipKey) return;
        
        // extract command
        var param = text.replace('/start ', '');

        let eventLable = '';
        
        // playlist
        if(param.startsWith(startParam_playlist))
        {
            console.log(`commands, begin to playlist`);
            var playlistID = param.split('-')[1];
            global.fn.m.userAbility.user.playlist.showById(userid, playlistID);
            
            eventLable = `playlist | ${playlistID}`;
        }

        // album
        else if(param.startsWith(startParam_album))
        {
            console.log(`commands, begin to album`);
            var albumid = param.split('-')[1];
            global.fn.m.userAbility.user.singers.album.showById(userid, albumid);
            
            eventLable = `album | ${albumid}`;
        }
				
		// media
		else if(param.startsWith(startParam_media))
        {
            console.log(`commands, begin to open media`);
            var mediaid = param.split('-')[1];
			var chatid = message.chat.id;
            global.fn.m.userAbility.user.singers.album.media.showbyid(userid, chatid, mediaid, {'mode':'main'});
            
            eventLable = `media | ${mediaid}`;
        }
			
		// search
		else if(param.startsWith(startParam_search))
        {
            console.log(`commands, begin to search`);
            var parts = param.split('-');
            var word = '';
            // combine phrase part
            for(var i=1; i < parts.length; i++)
            {
                word += `${parts[i]} `;
            }
            
            global.fn.m.userAbility.user.search.search(userid, word, user);
            
            eventLable = `search | ${word}`;
        }
        
        // analytic
        let eventCategory = 'backlink';
        let eventAction = 'open a section';
        //let eventOptions = {'dr': param};
        fn.m.analytic.trackEvent(userid, eventCategory, eventAction, eventLable);
    });
}
