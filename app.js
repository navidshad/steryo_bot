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
tcms.addModule(commerce.module);
//commerce.startServer(100);

module.exports.app = commerce.app;