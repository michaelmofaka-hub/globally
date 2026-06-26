import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  username:{
    type:string,
    required:true
  },
  password:{
    type:string,
    required:true
  },
  confirmpassword:{
    type:string,
    required:true
  },
  email:{
    type:string,
    required:true
  },
  mpesadetails:{
    type:string,
    
  },
  amount:{
    type:number,
    default:7.00
  },
  followers:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:user
  }],
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:user
  }]
},{timestamps:true});

const user = mongoose.model("userSchema", user);

export default user;