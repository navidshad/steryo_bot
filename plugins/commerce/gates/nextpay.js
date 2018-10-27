let soap = require('soap');

let GetToken = async function (order_id, amount, key) {
    let port = global.config.serverport;
    let callback_uri = global.config.domain + ':' + port + '/returnback/nextpay';
    console.log('nextpay callback: ' + callback_uri);
    let url = 'https://api.nextpay.org/gateway/token.wsdl';
    
    let payload = {
        'api_key': key,
        'order_id': order_id,
        'amount': amount,
        'callback_uri': callback_uri
    };

    let client = await soap.createClientAsync(url).then().catch(e => console.log(e));
    return client.TokenGeneratorAsync(payload).then();
};


let VerifyPayment = async function(trans_id, order_id, amount, key)
{
    // trans_id and order_id will POST to callback_uri
    let url = 'https://api.nextpay.org/gateway/verify.wsdl';
    let payload = {
        'api_key'   : key,
        'trans_id'  : trans_id,
        'order_id'  : order_id,
        'amount'    : amount
    };

    let client = await soap.createClientAsync(url).then();
    return client.PaymentVerificationAsync(payload);
};

let getPaylink = async function(fnumber, amount)
{
    //get session
    let session = null;
    session = await fn.db.nextpay.findOne({'order_id': fnumber}).exec().then();
    if(!session) session = await new fn.db.nextpay({'order_id': fnumber, 'amount': amount}).save().then();
    else session.amount = amount;

    //get nextpay api key
    let nextpayapikey = fn.getModuleData(fn.mstr.commerce['modulename'], 'nextpayapikey');
    nextpayapikey = (nextpayapikey) ? nextpayapikey.value : '...';

    //get new token
    return await GetToken(fnumber, amount, nextpayapikey)
    .then(async (result) => 
    {
        let TokenGeneratorResult = result[0].TokenGeneratorResult;

        //return fake url
        if(TokenGeneratorResult.code !== -1) {
            console.log('nextpay error: ' + result.TokenGeneratorResult.code);
            return 'https://api.nextpay.org/gateway/payment/***';
        }

        //save
        session.trans_id = TokenGeneratorResult.trans_id;
        session.code = TokenGeneratorResult.code;
        await session.save().then();

        //return url
        let url = 'https://api.nextpay.org/gateway/payment/' + session.trans_id;
        return url;
    })
    .catch(e => 
    {
        console.log(e);
        return 'https://api.nextpay.org/gateway/payment/***';
    });
}
module.exports = { VerifyPayment, getPaylink }