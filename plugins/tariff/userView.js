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

    return {'todayCounter': todayCounter, 'limit': limitnumb}
}

async function showMessage(userid)
{
    let limitMess = 'تعداد دانلود روزانه شما به اتمام رسیده است.';
    let limitMessOption = fn.getModuleData(name, 'downloadlimitMess');
    if(limitMessOption.value) limitMess = limitMessOption.value;
    
    // tariffs ------------------------
    let detailArr = [];
    console.log(name);
    let qt = fn.mstr[name].query;
    
    let tariffs = await fn.db.tariff.find({'active': true}).sort({'days':1}).exec().then();
    
    if(tariffs.length) limitMess += '\n\n' + '💎 تعرفه ها' + '\n';
    
    tariffs.forEach(tariff => 
    {
        let t_fn = qt[name] + '-' + qt['user'] + '-' + qt['pey'] + '-' + tariff.id;
        let t_txt = `${tariff.name} - ${tariff.price} تومان`;
        let t_btn = {'text': t_txt, 'callback_data': t_fn};
        detailArr.push([t_btn]);
        
        //add to message text
        let text = `✴️ ${tariff.name} | ${tariff.days} روزه | ${tariff.download_per_day} دانلود در روز`;
        limitMess += text + '\n';
    });
    
    limitMess += '\n.';

    let messOption = {"reply_markup" : {"inline_keyboard" : detailArr}};
    global.fn.sendMessage(userid, limitMess, messOption);
}

async function isUserLimitted(userid)
{
    let limited = false;
    let Dstatistics = await getDailylimitation(userid);
    
    // if limitted show message
    if(Dstatistics.todayCounter.counter >= Dstatistics.limit && version !== 'demo')
    {
        console.log('user has been limited for today');
        showMessage(userid);
        
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
    
    if(!limited)
    {
        //++counter
        Dstatistics.todayCounter.counter += 1;
        await Dstatistics.todayCounter.save().then();
    }
    
    return limited;
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
        
        fn.m.commerce.user.factor.create(userid, [product]);
    }
}

global.fn.eventEmitter.on('affterSuccessPeyment', async (factor) => 
{
    if(factor.products[0].type !== 'tariff') return;
    
    console.log('tariff aded to user');
});

module.exports = {
    isUserLimitted,
    showMessage,
    query,
};
