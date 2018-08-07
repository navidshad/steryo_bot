var tcms = require('telegram-cms');

var option = require('./config');
option.fn = {
    api: require('../lib/functions_api'),
    musicmetadataModule: require('musicmetadata'),
    musicmetadata: require('../lib/musicmetadata'),
}

// start bot
tcms.start(option);

// start express
require('./express/bin/www');