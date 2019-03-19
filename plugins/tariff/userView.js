let name = 'tariff';
async function getDailylimitation(userid)
{
    let today = Date.today();
    let limitnumb = 20;
    
    let limitOption = fn.getModuleData(name, 'downloadlimit');
    if(limitOption && !isNaN(parseInt(limitOption.value))) limitnumb = parseInt(limitOption.value);

    let todayCounter = await fn.db.dailylimitation.findOne({'userid':userid, 'date': today}).exec().then();
    if(!todayCounter)
        todayCounter = await new fn.db.dailylimitation({'userid':userid, 'date': today}).save().then();
        
    // check userTariff
    let userTariff = await getUserTariff(userid);
    if(userTariff.expire)
    {
        let compareToday = Date.today().compareTo(userTariff.expire); // 1 = greater, -1 = less than, 0 = equal
        if(compareToday <= 0) limitnumb = userTariff.download_per_day;
    }
    
    console.log(userid, 'limitnumb:', limitnumb, 'todayCounter:', todayCounter.counter);

    return {'todayCounter': todayCounter, 'limit': limitnumb}
}

async function getTariffs()
{
    let tariffs = await fn.db.tariff.find({'active': true}).sort({'price':-1}).exec().then();
    return tariffs;
}

async function showLimiteMessage(userid)
{
    let limitMess = 'تعداد دانلود روزانه شما به اتمام رسیده است.';
    let limitMessOption = fn.getModuleData(name, 'downloadlimitMess');
    if(limitMessOption.value) limitMess = limitMessOption.value;
    
    // tariffs ------------------------
    let detailArr = [];
    //console.log(name);
    let qt = fn.mstr[name].query;
    
    let tariffs = await getTariffs();
    
    if(tariffs.length) limitMess += '\n\n\n' + '💎 تعرفه ها' + '\n';
    
    tariffs.forEach(tariff => 
    {
        let t_fn = qt[name] + '-' + qt['user'] + '-' + qt['pey'] + '-' + tariff.id;
        let t_txt = `${tariff.name} - ${tariff.price} تومان`;
        let t_btn = {'text': t_txt, 'callback_data': t_fn};
        detailArr.push([t_btn]);
        
        //add to message text
        let text = `\n✴️ ${tariff.name} | ${tariff.days} روزه | ${tariff.download_per_day} دانلود در روز`;
        limitMess += text + '\n';
    });
    
    limitMess += '\n.';

    let messOption = {"reply_markup" : {"inline_keyboard" : detailArr}};
    global.fn.sendMessage(userid, limitMess, messOption);
    
    // analytic
    let pageName = 'limitation';
    let label = 'tariff';
    fn.m.analytic.trackPage(userid, pageName, label);
}

async function isUserLimitted(userid)
{
    let limited = false;
    let Dstatistics = await getDailylimitation(userid);
    
    // if limitted show message
    if(Dstatistics.todayCounter.counter >= Dstatistics.limit)
    {
        //record limitation message state
        let isTodayLimited = await global.fn.db.limitationMessage
                                .count({'userid' : userid, 'date': Date.today()}).exec().then();
                                
        if(isTodayLimited < 1)
        {
            await new global.fn.db.limitationMessage({
                'userid' : userid, 
                'limitation': Dstatistics.limit,
                }).save().then();
        }

        limited = true;
    }
    
    Dstatistics.limited= limited;
    return Dstatistics;
}

async function addToLimitationCounter(userid)
{
    let Dstatistics = await getDailylimitation(userid);
    Dstatistics.todayCounter.counter += 1;
    await Dstatistics.todayCounter.save().then();
}

async function createTariffFactor(userid, detail)
{
    let factor = await fn.m.commerce.user.factor.create(userid, [detail]);
    return factor;
}

async function query(query, speratedQuery, user, mName)
{
    let last = speratedQuery.length-1;
    let queryTag = fn.mstr[mName].query;
    let userid = query.from.id;

    // but a tariff
    if(speratedQuery[2] === queryTag['pey'])
    {
        console.log('pay a tariff');
        let tariff_id = speratedQuery[last];
        
        let tarriff = await fn.db.tariff.findOne({'_id':tariff_id}).exec().then();
        if(!tarriff) {
            global.fn.sendMessage(userid, 'این تعرفه دیگر موجود نیست.');
            return;
        }
        
        // create factor
        let product = {
            'name'  :tarriff.name,
            'id'    :tarriff.id,
            'type'  :'tariff',
            'price' :tarriff.price,
        }
        
        createTariffFactor(userid, product);
    }
}

global.fn.eventEmitter.on('affterSuccessPeyment', async (factor) => 
{
    if(factor.products[0].type !== 'tariff') return;
    console.log('tariff aded to user');
    
    let userid = factor.userid;
    
    // get tariff 
    let tid = factor.products[0].id;
    let tariff = await global.fn.db.tariff.findOne({'_id': tid}).exec().then();
    
    if(!tariff) global.fn.sendMessage(userid, 'تعرفه خریداری شده دیگر موجود نیست، لطفا با مدیر ربات تماس بگیرید.');
    
    // get user tariff
    let userTariff = await getUserTariff(userid);
    
    // update user tariff
    userTariff.expire           = Date.today().addDays(tariff.days);
    userTariff.download_per_day = tariff.download_per_day;
    userTariff.tariffName       = tariff.name;
    await userTariff.save().then();
    
    // go to main menu
    showUserTariff(userid);
});

async function getUserTariff(userid)
{
    let userTariff = await global.fn.db.userTariff.findOne({'userid': userid}).exec().then();
    if(!userTariff) userTariff = await new global.fn.db.userTariff({'userid': userid}).save().then();
    
    return userTariff;
}

async function showUserTariff(userid)
{
    let subscriptionMess = 'از خرید شما سپاس گذار هستیم، تعرفه فعلی شما به شرح زیر است:';
    let subscriptionMessOption = fn.getModuleData(name, 'subscriptionMess');
    if(subscriptionMessOption.value) subscriptionMess = subscriptionMessOption.value;
    
    let userTariff = await getUserTariff(userid);
    
    if(userTariff.expire)
    {
        subscriptionMess += '\n\n' + `💎${userTariff.tariffName} | ${userTariff.download_per_day} دانلود در روز`;
        subscriptionMess += '\n📆' + `تاریخ پایان: ${userTariff.expire.toString('M/d/yyyy')}`;
        subscriptionMess += '\n📆' + `تاریخ امروز: ${Date.today().toString('M/d/yyyy')}`;
        subscriptionMess += '\n .';
    }
    else {
        subscriptionMess = 'شما هنوز هیچ اشتراکی خریداری نکرده اید.';
    }

    global.fn.sendMessage(userid, subscriptionMess);
    
    // analytic
    let pageName = '💎اشتراک من';
    let label = 'tariff';
    fn.m.analytic.trackPage(userid, pageName, label);
}

module.exports = {
    isUserLimitted,
    addToLimitationCounter,
    showLimiteMessage,
    query,
    showUserTariff,
    getTariffs,
    createTariffFactor,
};
