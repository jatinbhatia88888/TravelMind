const Listing =require("../models/listing.js");

module.exports.searchListing=async (req,res)=>{
    const { query } = req.query;
    let filters = {};

    if (query) {
        filters.$or = [
            { title: { $regex: query, $options: "i" } },
            { location: { $regex: query, $options: "i" } }
        ];
    }
    const allListings = await Listing.find(filters);
    // console.log(listings);
    res.render("search.ejs",{allListings});
    
} 