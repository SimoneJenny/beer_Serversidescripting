const mongoose = require("mongoose");
const { Schema } = mongoose; // teknik der trækker et objekt ud af et andet objekt...
 
const beerModelType = new Schema({
    type: { type: String },
    beskrivelse: {type: String}

});
 
module.exports = mongoose.model("Beertypes", beerModelType);//obejt derfor stort start bogstav