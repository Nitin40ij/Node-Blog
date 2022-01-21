const formidable = require("formidable");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { check, validationResult } = require("express-validator");
const users = require("../models/user");
const Post = require("../models/Post");

const postForm = (req, res) => {
  res.render("createPost", {
    title: "Create new post",
    login: true,
    errors: [],
   input_title: "",
    body: "",
  });
};

const storePost = (req, res) => {
  const form = formidable();
  form.parse(req, (err, fields, files) => {
    const errors = [];
    const { title, body } = fields;
    if (title.length === 0) {
      errors.push({ msg: "Title is required" });
    }
    if (body.length === 0) {
      errors.push({ msg: "Body is required" });
    }
    //console.log(files.image.originalFilename);

    const imageName = files.image.originalFilename;
    const split = imageName.split(".");
    //console.log(split);
    const imageExtension = split[split.length - 1].toUpperCase();
    if (files.image.originalFilename.length === 0) {
      errors.push({ msg: "Image is required" });
    } else if (imageExtension !== "JPG" && imageExtension !== "PNG" && imageExtension !== "WEBP" ) {
      errors.push({ msg: " This image type is not allowed" });
    }
    //console.log(imageExtension);
    if (errors.length !== 0) {
      res.render("createPost", {
        title: "Create new post",
        login: true,
        errors,
       input_title:title,
        body,
      });
    } else {
      files.image.originalFilename = uuidv4() + "." + imageExtension;
      const oldPath = files.image.filepath;
      const newPath =
        __dirname + "/../views/assets/img/" + files.image.originalFilename;
      // res.send(files.image.filepath);
      fs.readFile(oldPath, (err, data) => {
        if (!err) {
          fs.writeFile(newPath, data, (err) => {
            if (!err) {
              fs.unlink(oldPath, async (err) => {
                if (!err) {
                  const id = req.id;
                  try {
                    const user = await users.findOne({ _id: id });
                    const name = user.name;
                    const newPost = new Post({
                      userID: id,
                      title,
                      body,
                      image: files.image.originalFilename,
                      userName: name,
                    });
                    try {
                      const result = await newPost.save();
                      if(result) {
                        req.flash("success", "Your post has been added succesfully 🙂");
                        res.redirect('/posts/1');
                      }
                    } catch (err) {
                      res.send(err.msg)
                    }
                  } catch (err) {
                    res.send(err.msg);
                  }

                  // res.send("Image uploaded")
                }
              });
            }
          });
        }
      });
    }
  });
};

const posts= async(req,res)=>{
    const id=req.id;
    let currentPage=1;
    const page=req.params.page;
    if(page){
        currentPage=page;   
    }
    const perPage = 4;
    const skip= (currentPage -1) * perPage;
    const allPosts = await Post.find({userID :id})
          .skip(skip)
         .limit(perPage)
          .sort({updatedAt:-1});
          const count=await Post.find({userID:id}).countDocuments();
     res.render("Posts" , {title : "Posts",login :true,posts:allPosts,count,perPage,currentPage})
}
const details= async (req,res)=>{
  const id= req.params.id;
  try{
  const details=await Post.findOne({_id:id})
  res.render('details',{title:"Post details" , login:true,details})
  }catch(err){
    res.send(err);
  }
}
const updateForm=async (req,res)=>{
  const id= req.params.id;
  try{
  const post= await Post.findOne({_id:id});
  res.render("update",{title:"Update Post" ,login:true,errors:[],post});
  }catch(err){
    res.send(err);
  }
}
const PostValidations = [
  check("title").not().isEmpty().withMessage("Title is required!"),
  check("body").not().isEmpty().withMessage("Body is required!"),
];
const postUpdate= async (req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const id= req.body.hiddenID;
    const post= await Post.findOne({_id:id});
    res.render("update",{title:"Update Post" ,login:true,errors:errors.array(),post});
  }
  else{
    const {hiddenID,title,body}= req.body;
    try{
      const updatedResult= await Post.findByIdAndUpdate(hiddenID,{title,body});
      if(updatedResult){
        req.flash("success", "Your post has been updated succesfully 🙂");
        res.redirect('/posts/1')
      }
    }catch(err){
      res.send(err);
    }
  }
}

const deletePost= async (req,res)=>{
  const id= req.body.deleteID;
  try{
    const response = await Post.findByIdAndRemove(id);
    if(response){
      req.flash("success", "Your post has been deleted succesfully");
        res.redirect('/posts/1')
    }
  }catch(err){
     res.send(err);
  }

}
module.exports = {
  postForm,
  storePost,
  posts,
  details,
  updateForm,
  postUpdate,
  PostValidations,
  deletePost
};
