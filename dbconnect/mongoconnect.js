const mongoose=require('mongoose')
require('dotenv').config()


const api_key=process.env.API_KEY

const mongodb=async()=>{
    try{
        await mongoose.connect(api_key)
        console.log('sucessfully connected to db')
    }
   catch (error) {
    console.error('❌ Mongoose connection error:', error.message);
    process.exit(1);
  }
}

module.exports={mongodb}