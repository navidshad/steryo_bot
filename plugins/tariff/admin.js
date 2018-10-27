let name = 'tariff';

var checkRoute = function(option)
{
    var btnsArr  = [
        fn.mstr[name]['name']
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

    //check seperate section
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

var show = async function(userid, injectedText)
{
    console.log(`got to ${name} section`);
    var titles = [
        [
            fn.mstr[name].btns['settings'],
            fn.mstr[name].btns['test'],
            fn.mstr[name].btns['addTariff'],   
        ]
    ];
    
    //listing tariffs
    let tariffs = await global.fn.db.tariff.find().sort('-_id').exec().then();
    tariffs.forEach(t => { titles.push(t.name); });

    //show list
    var mess = fn.mstr[name]['name'];
    var markup = fn.generateKeyboard({'custom':true, 'list': titles, 'back':fn.str.goToAdmin['back']}, false);
    global.robot.bot.sendMessage(userid, (injectedText) ? injectedText : mess, markup);
    fn.userOper.setSection(userid, mess, true);
}

async function create(name)
{
  let done = false;
  
  let exists = await global.fn.db.tariff.count({'name': name}).exec().then();
  
  if(exists) done = true;
  
  //create
  else {
      await new global.fn.db.tariff({'name': name}).save().then();
      done = true;
  }
  
  return done;
}

async function choose(userid, name, mName)
{
    let tariff = await global.fn.db.tariff.findOne({'name': name}).exec().then();
    if(!tariff) return;
  
    let detailArr = [];
    let qt = fn.mstr[mName].query;
    let qt_tariff = fn.mstr[mName]['query_tariff'];
    
    Object.keys(qt_tariff).forEach(vl => {
       fn_item =  qt[mName] + '-' + qt['admin'] + '-' + qt['tariff'] + '-' + vl + '-' + tariff.id;
       var tx_item = vl;
       detailArr.push([{'text': tx_item, 'callback_data': fn_item}]);
    });
    
    let messOption = {"reply_markup" : {"inline_keyboard" : detailArr}};
    
    let active = (tariff.active) ? '✅ فعال' : '⭕️ غیر فعال';

    let detailMess = '💎️ ' + tariff.name +" \n\n"
    + '✴️ ' + 'وضعیت: ' + active + '\n'
    + '✴️ ' + 'قیمت: ' + tariff.price +' واحد پولی \n'
    + '✴️ ' + 'مدت زمان: ' + tariff.days + ' روز \n'
    + '✴️ ' + 'تعداد دانلود: ' + tariff.download_per_day+ '/روز \n'
    + '\n .';

    global.robot.bot.sendMessage(userid, detailMess, messOption);
}

async function edit(userid, id, detail, mName)
{
    await fn.db.tariff.update({'_id':id}, detail).exec().then();
    let tariff = await fn.db.tariff.findOne({'_id':id}, 'name').exec().then();
    show(userid, 'انجام شد');
    choose(userid, tariff.name, mName);
}

var routting = async function(message, speratedSection, user, mName)
{
    let last = speratedSection.length-1;
    let text = message.text;
    let btns = fn.mstr[mName]['btns'];
    let userid = user.userid;
    
    // show section
    if(text === fn.mstr[mName]['name'] || text === fn.mstr[mName].back)
        show(message.from.id);
    
    // show setting
    else if(text === fn.mstr[name].btns['settings'])
        settings.show(message.from.id, name);

    else if(speratedSection[3] === fn.mstr[name].btns['settings'])
        settings.routting(message, speratedSection, user, name);
    
    //test tariffs
    else if(text === fn.mstr[name].btns['test'])
        userView.showMessage(userid);
    
    // tarif
    //add a tariff
    else if(text === btns['addTariff'])
    {
        let mess = fn.mstr['tariff']['mess']['addTariff'];
        let markup = fn.generateKeyboard({'section':fn.mstr[mName]['back']}, true);
        global.robot.bot.sendMessage(userid, mess, markup);
        fn.userOper.setSection(userid, mess, true);
    }
    else if (speratedSection[last] == fn.mstr['tariff']['mess']['addTariff'])
    {
        // create
        let created = await create(text);
    
        if(created) show(userid, 'انجام شد');
        else
        {
          let mess = fn.mstr['tariff']['mess']['addTariff'];
          global.robot.bot.sendMessage(userid, mess);
        }
    }
    
    // edit tariff
    else if (speratedSection[last-2] == fn.mstr['tariff']['mess']['editTariff'])
    {
        let tariffid = speratedSection[last];
        let detail = {};
        detail[speratedSection[last-1]] = text;
        edit(userid, tariffid, detail, mName);
    }
        
    // choose a tariff
    else choose(userid, text, mName);
}

let settings    = require('./settings');
let user        = require('./user');
let userView    = require('./userView');
let query       = require('./query');

module.exports = {
    name,
    checkRoute,
    routting,
    settings,
    user,
    userView,
    query,
    show,
}