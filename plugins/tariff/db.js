let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let tariffSchema = new Schema({
  name: String,
  active : {type: Boolean, default: true},
  price: {type: Number, default: 1000},
  days: {type: Number, default: 1},
  download_per_day: {type: Number, default: 50},
});

let userTariffShema = new Schema({
  userid: Number,
  expire: Date,
  download_per_day: Number,
  tariffName: String
});

module.exports.tariff = mongoose.model('tariffs', tariffSchema);
module.exports.userTariff = mongoose.model('userTariffs', userTariffShema);