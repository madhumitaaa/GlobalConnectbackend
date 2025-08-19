const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

const postSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    content:{type:String},
    image:{type:String},
    likes:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    comments:[{
      user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
        text:String,
        createdAt:{type:Date,default:Date.now}
}]
},{timestamps:true});

module.exports=mongoose.model('Post',postSchema);
