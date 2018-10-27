var name = require('./admin').name;
var tx_name = 'تعرفه ها';

var mstr = {
    modulename: name,
    //admin
    name:'💎 ' + tx_name, 
    back:'⤴️ برگشت به ' + tx_name,

    btns: {
        settings : '⚙️' + ' - ' + 'تنظیمات',
        backsetting: '⤴️ برگشت به ' + '⚙️' + ' - ' + 'تنظیمات',
        addTariff:'💎 ' + 'افزودن',
        test: 'آزمایش',
    },

    btns_user: {
        
    },

    query : {
        admin       : 'a',
        user        : 'u',
        settings    : 'stings',
        activation  : 'activate',
        category    : 'category',
        order       : 'order',
        tariff      : 'tariff',
        pey         : 'pey',
    },
    
    query_tariff : {
        name: 'name',
        active: 'active',
        price: 'price',
        days: 'days',
        download_per_day:'download_per_day',
    },

    sections: {
        editTariff:'editTariff',
    },

    mess : {
        addTariff:'لطفا نام تعرفه جدید را وارد کنید.',
        editTariff:'لطفا مقدار مربوطه را وارد کنید.',
    },

    datas: {
        downloadlimit: {
            'name':'محدودیت روزانه',
            'mess':'لطفا تعداد محدودیت دانلود روزانه را ارسال کنید، عدد',
        },
        downloadlimitMess:{
            'name':'پیام محدودیت',
            'mess':'لطفا پیامی که در هنگام محدودیت به کاربر ارسال می شود را ارسال کنید.',
        },
    }
}

mstr.query[name] = name;

module.exports[name] = Object.create(mstr);