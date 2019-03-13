module.exports.userAbility = {
    modulename:'userAbility',
    //admin
    name:'👨‍🚒 ' + 'امکانات کاربران', 
    back:'⤴️ برگشت به امکانات کاربران',

    btns: {
        activator:'🎛 ' + 'برد امکانات',
        settings:'⚙️ ' + 'تنظیمات کاربران استریو',
    },

    btns_user: {
        nextPage:'⬅️ ' + 'صفحه بعد',
        backPage:'➡️ ' + 'صفحه قبل',
    },

    query : {
        userAbility : 'userAbility',
        admin:'a',
        switchkey: 'skey',
        category:'cat',
        user:'u',
        album:'a',
        media:'m',
        addtoplaylist:'apl',
        chooseplaylist:'cply',
        playlist:'ply',
        like:'like',
        back:'bck',
        showmedia:'sm',
        getallmedia:'gm',
        close:'close',
        settings:'sts',
        activation:'act',

        favorites:'fav',
        version:'ver',
        search:'sr',
        page:'pg',
    },

    access: [
        { name:'archive', value:'🎶 ' + 'آرشیو موسیقی', key: true },
        { name:'favorites', value:'♥️ ' + 'گلچین من', key: true },
        { name:'playlist', value:'💽 ' + 'پلی لیست ها', key: true },
        { name:'search', value:'🔎 ' + 'جستجو موسیقی', key: true, hide: true },
    ],

    sections : {
        search:'search',
        s:'singer', 
        a:'album',
        playlist:'playlist',
    },

    datas: {
        notFound: {
            'name': '💬 ' + 'پیام جستجو ناموفق',
            'mess': 'لطفا متنی که میخواهید در هنگان 404 نمایش داده شود را ارسال کنید.',
        },
        downloadlimit: {
            'name':'محدودیت روزانه',
            'mess':'لطفا تعداد محدودیت دانلود روزانه را ارسال کنید، عدد',
        },
        downloadlimitMess:{
            'name':'پیام محدودیت',
            'mess':'لطفا پیامی که در هنگام محدودیت به کاربر ارسال می شود را ارسال کنید.',
        },
        musicCaption:{
            'name':'کپشن ترانه ها',
            'mess':'لطفا متن کپشنی که میخواهید در زیر ترانه ها اضافه شود را ارسال کنید.',
        },
        searchresultmode:{
            'name'  :'حالت نتیجه جستجو',
            'mess'  :'لطفا حالی نمایش نتیجه جستجو را مشخص کنید.',
            'items' :[
                {'name': 'keyboard', 'lable':'کیبرد پایین'},
                {'name': 'inlinekeyboard', 'lable':'کیبرد شیشه ای'},
            ]
        }
    }
}