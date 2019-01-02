var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) 
{
  // get rariffs
  let tariffs = await global.fn.m.tariff.userView.getTariffs();
  
  // render page
  res.render('subscription', { 
    title: 'رسانه موسیقی کوردی ملودیکو',
    subscriptions : tariffs,
  });
});

// buy 
router.post('/but_ariff', async (req, res, next) =>
{
  let result = {};
  let body = req.body;
  
  let userid = parseInt(body.userid);
  if(isNaN(userid)) userid = 0;
  
  console.log(body);
  
  // check userid
  let usercount = await global.fn.db.user.count({'userid': userid}).exec().then();
  
  if(usercount)
  {
     // create factor
    let product = {
        'name'  :body.tariffName,
        'id'    :body.tariffid,
        'price' :parseFloat(body.price),
        'type'  :'tariff',
    }
          
    console.log('create factor for browser');
    let factor = await global.fn.m.tariff.userView.createTariffFactor(userid, product);
    console.log('create paylink for browser');
    let nextpaylink = await global.fn.m.commerce.gates.nextpay.getPaylink(factor.number, factor.discount);
    
    result = {'status':'success', 'link': nextpaylink};
  }
  
  else result = {'status':'fail', 'message': 'شماره کاربری در سیستم ثبت نشده است'};
  
  res.send(result);
});

module.exports = router;
