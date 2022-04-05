const mongoose = require("mongoose");
const { Schema } = mongoose; // teknik der trækker et objekt ud af et andet objekt...
 
const beerModel = new Schema({
    navn: { type: String },
    farve: { type: String },
    procenter: { type: Number },
    produktions: { type: Number },
    type: {type: String},
    billede: {type:String}
});
 
module.exports = mongoose.model("Beer", beerModel);//obejt derfor stort start bogstav
