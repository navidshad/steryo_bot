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
    },

    sections: {

    },

    mess : {

    },

    datas: {
        // data: {
        //     'name': '',
        //     'mess': '',
        // },
    }
}

mstr.query[name] = name;

module.exports[name] = Object.create(mstr);