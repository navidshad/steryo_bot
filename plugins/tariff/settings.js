let mainBtnsPermissions = {
    'activation': true,
    'category': true,
    'order': true,
}

let getSettingsInlinesBtns = function(options)
{
    let detailArr = [],
    mName   = options.mName,
    qt      = fn.mstr[mName].query,
    fn_activation = qt[mName] + '-' + qt['admin'] + '-' + qt['settings'] + '-' + qt['activation'] + '-' + qt[mName],
    fn_category   = qt[mName] + '-' + qt['admin'] + '-' + qt['settings'] + '-' + qt['category'] + '-' + qt[mName],
    fn_order      = qt[mName] + '-' + qt['admin'] + '-' + qt['settings'] + '-' + qt['order'] + '-' + qt[mName],

    tx_activation = fn.str.activation[options.activation],
    tx_category   = fn.mstr['category'].asoption,
    tx_order      = fn.str['editOrder'];

    let firstrow = [];
    if(mainBtnsPermissions.activation) firstrow.push({'text': tx_activation, 'callback_data': fn_activation});
    if(mainBtnsPermissions.category) firstrow.push({'text': tx_category, 'callback_data': fn_category});
    if(mainBtnsPermissions.order) firstrow.push({'text': tx_order, 'callback_data': fn_order});
    detailArr.push(firstrow.reverse());

    //data parameters
    let datas = Object.keys(fn.mstr[mName].datas);
    let row = [];
    datas.forEach((item, i) => 
    {
        let fn_item = qt[mName] + '-' + qt['admin'] + '-' + qt['settings'] + '-' + item + '-' + qt[mName];
        let tx_item = fn.mstr[mName].datas[item].name;
        row.push({'text': tx_item, 'callback_data': fn_item});
        
        if(row.length == 2 || i == datas.length-1) {
            detailArr.push(row);
            row = [];
        }
    });

    return detailArr;
}

let getDatsDetail = function(moduleOption, mName)
{
    let mess = '';
    moduleOption.option.datas.forEach(data => {
        let key = (data.key) ? data.key + ', ' : '';
        let value = (data.value) ? data.value : '';
        mess += '\n' + '✴️ ' + fn.mstr[mName].datas[data.name].name + ': ' + key + value;
    });

    return mess;
}

let show = function(userid, mName, newcat)
{
    let activationtext = '';
    let moduleOption = fn.getModuleOption(mName, {'create': true});
    
    //defin activation button
    activationtext = (moduleOption.option.active) ? 'disable' : 'enable';
    //defin new category
    if(newcat) {
        moduleOption.option.category = newcat;
        //let buttons = fn.mstr[mName].btns_user;
        //if(buttons) moduleOption.option.buttons = Object.values(buttons);
        global.robot.config.moduleOptions[moduleOption.index] = moduleOption.option;
        //save configuration
        global.robot.save();
        fn.updateBotContent();
    }

    let detailArr = getSettingsInlinesBtns({'mName':mName,'activation': activationtext});
    let messOption = {"reply_markup" : {"inline_keyboard" : detailArr}};
    
    let title = fn.mstr[mName].name;
    let category = (moduleOption.option.category) ? moduleOption.option.category : 'نامشخص';
    let buttons = (moduleOption.option.buttons) ? moduleOption.option.buttons : 'نامشخص';
    let btn_order = (moduleOption.option.btn_order) ? moduleOption.option.btn_order : 'نامشخص';
    let active = (moduleOption.option.active) ? '✅ فعال' : '⭕️ غیر فعال';
    let datas = getDatsDetail(moduleOption, mName);

    let detailMess = 'اطلاعات افزونه ' + title + '\n'
    + '✴️ ' + 'دسته: ' + category + '\n'
    + '✴️ ' + 'نام دکمه در منو: ' + buttons + '\n'
    + '✴️ ' + 'اولویت در منو: ' + btn_order + '\n'
    + '✴️ ' + 'وضعیت: ' + active + '\n' 
    + datas + '\n'
    + '⚙️';

    global.robot.bot.sendMessage(userid, detailMess, messOption);
}

let routting = function(message, speratedSection, user, mName)
{
    let text = message.text;
    let last = speratedSection.length-1;
    //show inbox setting
    if (text === fn.mstr[mName].btns['settings'])
        show(message.from.id, mName);


    //set category
    else if(speratedSection[last] == fn.mstr['category'].asoption)
    {
        console.log('get new category for inbox');
        let cat = text.split(' - ')[1];
        if(fn.m.category.checkInValidCat(cat)) {
            show (message.from.id, mName, cat);
            fn.m[mName].show(message.from.id);
        }
        else global.robot.bot.sendMessage(message.from.id, fn.str['choosethisItems']);
    }

    //change order
    else if(speratedSection[last] === fn.str['editOrder'])
    {
        let order = parseInt(text);
        if(!typeof order === 'number') global.robot.bot.sendMessage(message.from.id, fn.str['editOrder']);

        let moduleOption = fn.getModuleOption(fn.mstr[mName]['modulename']);
        global.robot.config.moduleOptions[moduleOption.index].btn_order = order;
        //save configuration
        global.robot.save();
        fn.updateBotContent(() => { 
            show(message.from.id, mName);
            fn.m[mName].show(message.from.id);
        });
    }

    //dates
    else
    {
        let mstrdatas = Object.keys(fn.mstr[mName].datas);
        let key = false;
        mstrdatas.forEach(item => {
            if(item === speratedSection[last]) key = true;
        });

        if(!key) return;

        let itemSection = speratedSection[last];
        let dataOption = fn.mstr[mName].datas[itemSection];

        let value = text;
        if(dataOption.items)
        {
            key = false;
            dataOption.items.forEach(element => {
                if(element.lable === text) {
                    key = true;
                    value = element.name;
                }
            });
        }

        if(!key) return;

        let datas = [{'name': itemSection, 'value':value}];
        fn.putDatasToModuleOption(mName, datas);
        
        global.robot.save();
        show (message.from.id, mName);
        fn.m[mName].show(message.from.id);
    }
}

let query = function(query, speratedQuery, user, mName)
{
    console.log('setting query routting');
    let last = speratedQuery.length-1;
    let queryTag = fn.mstr[mName].query;

    //activation
    if(speratedQuery[3] === queryTag['activation'])
    {
        console.log(`active deactive ${mName}`);
        let moduleOption = fn.getModuleOption(mName);
        let key = global.robot.config.moduleOptions[moduleOption.index].active;
        global.robot.config.moduleOptions[moduleOption.index].active = !key;
        //save configuration
        global.robot.save();
        fn.updateBotContent(() => {
            show(query.from.id, mName);
        });
    }

    //setcategory
    else if (speratedQuery[3] === queryTag['category'])
    {
        console.log(`set categori for ${mName}`);
        let nSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr[mName]['name'] + '/' + fn.mstr[mName].btns['settings'] + '/' + fn.mstr['category'].asoption;
        let back = fn.mstr[mName]['back'];
        let list = [];
        global.robot.category.forEach((element) => {
            list.push(element.parent + ' - ' + element.name);
        });
        let markup = fn.generateKeyboard({'custom': true, 'grid':false, 'list': list, 'back':back}, false);

        global.robot.bot.sendMessage(query.from.id, fn.str['editCategory'], markup);
        fn.userOper.setSection(query.from.id, nSection, false);
    }

    //order
    else if (speratedQuery[3] === queryTag['order'])
    {
        let nSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr[mName]['name'] + '/' + fn.mstr[mName].btns['settings'] + '/' + fn.str['editOrder'];
        let remarkup = fn.generateKeyboard({'section': fn.mstr[mName]['back']}, true);
        global.robot.bot.sendMessage(query.from.id, fn.str['editOrderMess'], remarkup);
        fn.userOper.setSection(query.from.id, nSection, false);
    }

    //datas
    else
    {
        let datas = Object.keys(fn.mstr[mName].datas);
        let key = false;
        datas.forEach(item => {
            if(item === speratedQuery[3]) key = true;
        });

        if(!key) return;

        let itemSection = speratedQuery[3];
        let dataOption = fn.mstr[mName].datas[itemSection];

        let list = [];
        let back = fn.mstr[mName]['back'];

        if(dataOption.items) dataOption.items.forEach(element => { list.push(element.lable) });

        let mess = dataOption.mess;
        let nSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr[mName]['name'] + '/' + fn.mstr[mName].btns['settings'] + '/' + itemSection;
        let remarkup = fn.generateKeyboard({'custom': true, 'grid':false, 'list': list, 'back':back}, false);

        global.robot.bot.sendMessage(query.from.id, mess, remarkup);
        fn.userOper.setSection(query.from.id, nSection, false);
    }
}

module.exports = { routting, query, show }