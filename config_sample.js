module.exports = {
    //bot
    dbpath      :'',
    token       :'',

    testRun     : false,
    dbpath_test :'',
    token_test  :'',

    botusername :'steryobot',
    modules:{
        'category'          :true,
        'post'              :true,
        'commerce'          :false,
        'settings'          :true,
        'search'            :false,
        'inbox'             :true,
        'sendbox'           :true,
        'chanelChecker'     :true,
        'favorites'         :false,
        'telegram-cms-commerce': true,

        'arc'               :true,
        'userAbility'       :true,
        'tariff'            :true,
    },

    //web
    serverport:3002,

    //folders
    temp : require('path').join(__dirname, 'temp'),
    modulespath: require('path').join(__dirname, 'plugins'),
}
