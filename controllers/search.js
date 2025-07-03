const Listing =require("../models/listing.js");

module.exports.searchListing=async (req,res)=>{
    const { query } = req.query;
    let filters = {};

   
       if (query) {
    filters.$or = [
        { title: { $regex: query, $options: "i" } },
        { "location.city": { $regex: query, $options: "i" } },
        { propertyType: { $regex: query, $options: "i" } } // <-- NEW LINE
    ];
}

    
    const allListings = await Listing.find(filters);
   
    res.render("search.ejs",{allListings});
    
} 