var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dailylimitationSchema = new Schema({
  userid      : Number,
  date        : Date,
  counter     : {type:Number, default:0},
});

var wordSchema = new Schema({
  userid: Number,
  word: String,
  date: Date,
  count: Number,
});

var mediaSearchSchema = new Schema({
  userid: Number,
  title: String,
  artist: String,
  date: Date,
})

var mediaSchema = new Schema({
    filename    : String,
    title       : String,
    artist      : [String],
    albumartist : String,
    album       : String,
    year        : Number,
    genre       : [String],
    track       : { no : Number, of : Number },
    disk        : { no : Number, of : Number},
    picture     : [{format:String, data:Buffer}],
    duration    : Number, // in seconds
    path        : String,
    telegramid  : String,
    type        : String,
    lyric       : String,
    titleIndex  : {
            'ku_fa' :String,
            'ku_so' :String,
            'ku_la' :String,
            'more'  :String,
        },
});

var favoriteBagSchema = new Schema({
  userid: Number,
  type: String,
})

var limitationMessage = new Schema({
  userid: Number,
  limitation: Number,
  date: { type: Date, default: Date.today() },
});

module.exports.dailylimitation = mongoose.model('dailylimitation', dailylimitationSchema);
module.exports.word = mongoose.model('words', wordSchema);
module.exports.mediaSearch = mongoose.model('mediaSearch', mediaSearchSchema);
module.exports.media = mongoose.model('medias', mediaSchema);
module.exports.favbag = mongoose.model('favoriteBags', favoriteBagSchema);
module.exports.limitationMessage = mongoose.model('limitationMessages', limitationMessage);