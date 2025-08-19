const Post=require('../models/Post.js');

exports.createPost=async(req,res)=>{
    try{
        console.log('req.file:', req.file);
console.log('req.body:', req.body);

            const {image,content}=req.body;
            const newPost=await Post.create({
                     userId: req.user._id,
                    content: req.body.content,
                    image: req.file?.path,
            });
            res.status(201).json(newPost);
    }
    catch(err){
        res.status(500).json({error:err.message});
    }
}

exports.getAllPosts=async(req,res)=>{
    try{
        const posts=await Post.find().populate("userId","name profilePic").sort({createdAt:-1});
        res.status(200).json(posts);

    }catch(err){
         res.status(500).json({ message: "Failed to fetch posts", error: err.message });
  }
}

exports.updatePost=async(req,res)=>{
    try{
        const { postId }=req.params;
        const post=await Post.findById(postId);
        if(!post) return res.status(404).json({message:"post not found"});
        if(!post.userId.equals(req.user._id)){
             return res.status(403).json({ message: "Not authorized" });
        }
        if(req.body.content)post.content=req.body.content;
        if(req.file)post.image=req.file.path;
           await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Failed to update post", error: err.message });
  }
}




exports.deletePost=async(req,res)=>{
    try{
        const {postId}=req.params;
        const post=await Post.findById(postId);
        
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await post.remove();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post", error: err.message });
  }
}










exports.toggleLike=async(req,res)=>{

    try{
    const{postId}=req.body;
    const userId=req.user._id;
    const post=await Post.findById(postId);
    if(!post)res.status(404).json({message:"post not found"});
    if(post.likes.includes(userId)){
        post.likes.pull(userId);//unlike
    }
     else{
        post.likes.push(userId);//like
     }


await post.save();
res.status(201).json({message:"likes updated",likes:post.likes});
    }
catch(err){
    res.status(501).json({message:"error updating likes",error:err.message});
}

}

exports.addComment=async(req,res)=>{
    try{
            const { postId }=req.params;
            const { text }=req.body;
            const userId=req.user._id;
            const post=await Post.findById(postId);
            if(!post)res.status(500).json({message:"post not found"});

            post.comments.push({user:userId,text});
            await post.save();
            res.status(201).json({message:"comments updated",comments:post.comments});
            
    }
    catch(err){
            res.status(500).json({message:"error adding comment", error:err.message});
    }
}