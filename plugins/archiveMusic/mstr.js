module.exports.archiveMusic = {
    modulename  : 'archiveMusic',
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

    },

    sections    : {
        s:'singer', 
        a:'album'
    },
    
    qu : {
        archiveMusic: 'am',
        admin:'a',
        u_album : 'al',
        u_media : 'md',
        a_album : 'al',  //admin 
        a_media : 'amdi',  //admin section
        a_playlist  :'pls',
        showmedia   :'showmedia',
        getallmedia :'getallmedia',
        delete  : 'del',
        deletefromlist  :'deft',
        edit    : 'edit',
        reload  : 'reload',
        close   : 'close',
        addtoplaylist : 'addtplyls',
        name    : 'name',
        chooseplaylist : 'cpls',
        back : 'back',
        like :'like',
        link:'lnk',
        settoHome: 'sHome',
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