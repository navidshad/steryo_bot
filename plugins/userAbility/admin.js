var name = 'userAbility';

var checkRoute = function(option) {
    var btnsArr  = [ 
        fn.mstr.userAbility['name'],
        fn.mstr.userAbility['back']
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

var showActivatorBoard = function (user) 
{
    //get module details
    var mstrAccess = fn.mstr.userAbility.access.map((item) => { 
        var newItem = {}
        newItem.name = item.name;
        newItem.value = item.value;
        return newItem;
    });

    var sttings = {'name':name, 'active':true, 'datas':[], 'btn_order':1, 'category': fn.mstr.category['maincategory']}
    var userAbilityModuleOption = fn.putDatasToModuleOption(name, mstrAccess, sttings);
    var datas = userAbilityModuleOption.option.datas;
    //board message
    var mess = 'امکانات بخش موسیقی برای کاربران';
    //inline buttons
    var detailArr = [];
    var queryTag = fn.mstr.userAbility.query;
    datas.forEach((item, i) => {
        var key = false;
        mstrAccess.map(ma => {if(ma.name == item.name) key = true})
        if(!key) return;
        var fn_item = queryTag['userAbility'] + '-' + queryTag['admin'] + '-' + queryTag['switchkey'] + '-' + i;
        var icon = (item.key === true) ? '✅ ' : '';
        var tx_item = icon + item.value;
        var buttons = {'text': tx_item, 'callback_data': fn_item};
        detailArr.push([buttons]);
    });
    //send
    global.fn.sendMessage(user.userid, mess, {'parse_mode':'HTML', "reply_markup" : {"inline_keyboard" : detailArr}});
}

var editUserAbility = async function (user, detail) {
    var moduleOption = fn.getModuleOption(name, {'create': true});
    var datas = moduleOption.option.datas;
    if(detail.switch) datas[detail.index].key = !datas[detail.index].key;
    fn.putDatasToModuleOption(name, datas);
    await global.robot.save();
    showActivatorBoard(user);
}

var show = function(userid, injectedMess)
{
    var titles = [
        fn.mstr.userAbility.btns['activator'],
        fn.mstr.userAbility.btns['settings'],
    ];
    
    //show list
    var mess = (injectedMess) ? injectedMess : fn.mstr.userAbility['name'];
    var back = fn.str.goToAdmin['back'];
    var markup = fn.generateKeyboard({'custom':true, 'grid':true, 'list': titles, 'back':back}, false);
    global.fn.sendMessage(userid, mess, markup);
    fn.userOper.setSection(userid, mess, true);
}

var routting = async function(message, speratedSection, userProfile)
{
    var text = message.text;
    var last = speratedSection.length-1;
    var btns = fn.mstr.userAbility.btns;

    //show userAbility setting
    if (text === fn.mstr.userAbility['name'] || text === fn.mstr.userAbility['back'])
        show(userProfile.userid);

    //activator board
    else if(text === btns['activator'])
        showActivatorBoard(userProfile);

    else if (text == btns['settings'] || speratedSection[last-1] == btns['settings'])
        settings.routting(message, speratedSection, userProfile, name);
}

require('./inlineQuery')();

var settings = require('./settings');
var user = require('./user');
var query = require('./query');

module.exports = { name, checkRoute, routting, settings, user, query, editUserAbility, show }