var tcms = require('telegram-cms');

var option = require('./config');
option.fn = {
    api: require('../s_lib/functions_api'),
    musicmetadataModule: require('musicmetadata'),
    musicmetadata: require('../s_lib/musicmetadata'),
}

// start bot
tcms.start(option);

// add commerce
let commerce = require('telegram-cms-commerce');
commerce.startServer(80);
tcms.addModule(commerce.module);

// start express
//require('./express/bin/www');