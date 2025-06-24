const mongoose=require("mongoose");
const initData =require("./data.js");
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const Listing=require("C:/Users/Lenovo/OneDrive/Desktop/MAJORPROJECT/models/listing.js");
main()
.then(()=>{
    console.log("connected to Db");
})
.catch((err)=>{
    console.log("oops error");
})
async function main(){
    await mongoose.connect(MONGO_URL);
}
const initDB =async ()=>{
    await Listing.deleteMany({});
    initData.data= initData.data.map((obj)=>({ ...obj,owner:"67cbebb4fde60d995ca8199f"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};
initDB();