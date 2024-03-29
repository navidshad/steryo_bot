module.exports.arc = {
    modulename  : 'arc',
    name        : '🎙 ' + 'آرشیو موسیقی', 
    back        : '🎙 ' + 'آرشیو موسیقی' + ' ⬅️',

    search      :'search',
    liked       : '♥️',
    disliked    : '🖤',

    btns: {
        singers     : {lable: '🎙 ' + 'خوانندگان', back:'⤴️ برگشت به ' + '🎙 ' + 'خوانندگان'},
        playlists   : {lable:'🎶 ' + 'لیست ها پخش', back: '🎶 ' + 'لیست ها پخش' + ' ⬅️'},
        addmusic    : '💽 ' + 'افزودن موسیقی',
        addlist     : '✏️ ' + 'افزودن لیست جدید',
    },

    btns_user: {
        nextPage:'⬅️ ' + 'صفحه بعد',
        backPage:'➡️ ' + 'صفحه قبل',
    },

    sections    : {
        s:'singer', 
        a:'album'
    },
    
    qu : {
        arc: 'arc',
        admin:'a',
        u_album : 'ua',
        u_media : 'um',
        a_album : 'aa',  //admin 
        a_media : 'am',  //admin section
        a_playlist  :'al',
        showmedia   :'sm',
        getallmedia :'al',
        delete  : 'd',
        deletefromlist  :'dl',
        edit    : 'et',
        reload  : 'rd',
        close   : 'cls',
        addtoplaylist : 'atp',
        name    : 'nm',
        back : 'bck',
        like :'lk',
        link:'lk',
        settoHome: 'sH',

        chooseplaylist : 'cpl',
        navigateplaylist : 'nav',
        next : '1',
        back : '-0',
    },

    mess : {
        addlist : 'لظفا یک نام برای لیست پخش جدید ارسال کنید.',
        e_listname : 'لطفا یک نام جدید برای این لیست پخش امتخاب کنید.',
        chooseothernameforlist : 'لطفا نام دیگری برای لیست پخش جدید ارسال کنید.',
        deletedplaylist : 'این لیست پخش دیگر وجود ندارد',
        noplaylist : 'هنوز هیچ لیست پخشی ساخته نشده است.',
        nomedia : 'این مدیا دیگر موجود نمیباشد',
    },

    menu :{
        recently    :'⭐️ ' + 'تازه ها',
        mostliked   :'♥️ ' + 'محبوب ها',
        archive     :{lable:'💽 ' + 'آرشیو موسیقی', back:'⤴️ برگشت به ' + '💽 ' + 'آرشیو'},
    },

    linkRoutes: {
        playlist:'playlist',
        album   :'album',
		media 	:'media',
		search	:'search',
    }
}