let name = require('./admin').name;
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

function showMessage(userid)
{
    limitMess = 'تعداد دانلود روزانه شما به اتمام رسیده است.';
    let limitMessOption = fn.getModuleData(name, 'downloadlimitMess');
    if(limitMessOption.value) limitMess = limitMessOption.value;
    
    global.fn.sendMessage(userid, limitMess);
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

module.exports = {
    isUserLimitted,
    showMessage,
};