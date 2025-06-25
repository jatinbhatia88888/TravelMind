const Joi=require('joi');
module.exports.listingSchema=Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    roomCount: Joi.number().required().min(1),
    category: Joi.string().valid('budget', 'luxury', 'resort', 'hostel', 'homestay', 'boutique').required(),
    amenities: Joi.array().items(Joi.string()),
    checkIn: Joi.string().required(),
    checkOut: Joi.string().required(),
    cancellationPolicy: Joi.string().valid('free_24h', 'partial', 'none'),
    propertyType: Joi.array().items(Joi.string()),

  
    location: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      pincode: Joi.string().required()
    }).required()
  }).required()
});

module.exports.reviewSchema= Joi.object({
    review: Joi.object({
      rating:Joi.number().required().min(1).max(5),
      comment: Joi.string().required(),
    }).required()
});