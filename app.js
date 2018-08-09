var tcms = require('telegram-cms');

var option = require('./config');
option.fn = {
    api: require('../s_lib/functions_api'),
    musicmetadataModule: require('musicmetadata'),
    musicmetadata: require('../s_lib/musicmetadata'),
}

// start bot
tcms.start(option);

// start express
require('./express/bin/www');