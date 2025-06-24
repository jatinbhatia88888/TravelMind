const mongoose =require("mongoose");
const Schema=mongoose.Schema;

const favouriteSchema = new mongoose.Schema({
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
        listingId: [{ type: Schema.Types.ObjectId, ref: 'Listing', required: true }] 
    });
    
    

module.exports =mongoose.model("favourite",favouriteSchema);