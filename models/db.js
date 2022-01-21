const mongoose=require("mongoose");
const connect= async()=>{
    try{
        await mongoose.connect(process.env.DB)
        console.log("DataBase connection created");
    }catch(err){
        console.log(err.message);
    }
  
}
module.exports=connect;