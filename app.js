const express = require("express")
const app=express()

const loginModel = require("./models/login")
const messageModel = require("./models/message")

const cookieparser = require("cookie-parser");
const path = require('path');

app.use(cookieparser());
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))

const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken");
// const user = require("./models/user");


app.set('view engine','ejs');

app.get("/",(req,res)=>{
    console.log(req.url);
    res.render('login')
})


app.post("/register",async (req,res)=>{
    console.log(req.body)
    let {name,username,skill,email,github,linkedin,password}=req.body

    let user=await loginModel.findOne({username})
    if(user){
        return res.status(500).send("User Alrady Registerd")
    }
    
    const saltRounds=10;
    bcrypt.genSalt(saltRounds,(err,salt)=>{
        bcrypt.hash(password,salt,async (err,hash)=>{
            let user = await loginModel.create({
                name,
                username,
                skill,
                email,
                github,
                linkedin,
                password:hash
            })

            let token=jwt.sign({username:username,userid:user._id},'secret-key');
            res.cookie('token',token)
            res.render('HomePage',{name:name})
        })
    })

  
    
})

app.get("/Register",(req,res)=>{
    res.render("index")
})

app.get("/footer",(req,res)=>{
    res.render("footer",{result:{}})
})

app.post("/footer",async (req,res)=>{
    let {search} =req.body
    console.log(search)
    let result = await loginModel.find({skill:search})
    console.log(result)
    res.render("footer",{result:result})
})

app.get("/message",(req,res)=>{
    res.render("message")
})

app.get("/PersonalMessages",isLoggedIn,async (req,res)=>{
    let user=req.user.username
    let data=await messageModel.find({from:user})
    console.log(data)
    res.render('PersonalMessages',{data:data})
})



app.post('/login',async(req,res)=>{
    let {username,password}=req.body;

    console.log(req.body)

    let user=await loginModel.findOne({username})
    if(!user){
        return res.status(500).send("Email or password is invalid")
        
    }


    bcrypt.compare(password,user.password,(err,result)=>{
        if(result){
            
            let token=jwt.sign({username:username,userid:user._id},'secret-key');
            res.cookie('token',token)
            res.status(200).redirect('/home');
            
        }
        else{
            res.send('Email or Password is Incorrect')
        }
    })
})

app.get("/aboutus",(req,res)=>{
    res.render('aboutus')
})

app.get('/logout',(req,res)=>{
    res.cookie('token', '')
    res.redirect('/')
})

app.get("/reply",(req,res)=>{
    res.render("MessageBox")
})

app.get("/text/:username", isLoggedIn, async (req, res) => {
    let userMessages = await messageModel.findOne({ from: req.user.username, to: req.params.username });
    let user = (userMessages ? userMessages.content : []);
    console.log(userMessages);
    res.render("text", { username: req.params.username, usermessage: user });
});

// POST Route
app.post("/text/:username", isLoggedIn, async (req, res) => {
    let from = req.user.username;
    let to = req.params.username;
    console.log(from, to);
    let messagesobject = `${from}: ${req.body.text}`;
    console.log(messagesobject);

    // Update message for the recipient
    let m1 = await messageModel.findOneAndUpdate(
        { from, to },  // Filter condition
        {
            $push: { content: messagesobject },  // Push the new message string into the content array
            $set: { lastUpdated: Date.now() }  // Update the lastUpdated timestamp
        },
        { new: true, upsert: true }  // Return the updated document, create if it doesn't exist
    );

    // Update the message for the sender (mirrored conversation)
    let m2 = await messageModel.findOneAndUpdate(
        { from: to, to: from },
        { $push: { content: messagesobject }, $set: { timestamp: Date.now() } },
        { new: true, upsert: true }
    );

    // Redirect to the GET route after the message is sent
    res.redirect(`/text/${to}`);
});


//protected route
app.get('/home',isLoggedIn,async (req,res)=>{
    console.log(req.user)
    let user = await loginModel.findOne({username:req.user.username})
    res.render('HomePage',{name:user.name})
})

app.get('/delete/:username',isLoggedIn,async (req,res)=>{
    const result = await messageModel.deleteOne({ from:req.user.username,to:req.params.username });
    res.redirect('/PersonalMessages')
})

app.get('/dashboard',isLoggedIn,async (req,res)=>{
    let result= await loginModel.findOne({username:req.user.username})
    res.render('dashboard',{result:result})
})

app.get("/userdelete",isLoggedIn, async (req,res)=>{
    await loginModel.deleteOne({username:req.user.username})
    await messageModel.deleteOne({from:req.user.username})
    res.cookie('token',' ');
    res.redirect('/')
 })


 app.get("/updateuser",isLoggedIn, async (req,res)=>{
    let result = await loginModel.findOneAndUpdate({username:req.user.username})
    res.render('update',{result:result})
 })

 app.post("/updateuser",isLoggedIn, async (req,res)=>{
    let {name,skill,email,github,linkedin}=req.body;
    console.log(req.body)
    let m1 = await loginModel.findOneAndUpdate(
        { username: req.user.username }, 
        {
            $set: { 
                name: name, 
                skill: skill, 
                email: email, 
                github: github, 
                linkedin: linkedin 
            } 
           
        } // Filter condition
        
    );
    console.log(m1);

    res.redirect("/dashboard");
      
 })

 
 

function isLoggedIn(req,res,next){
        if(req.cookies.token===''){
             res.send("not authorized")
        }
        else{
            let data=jwt.verify(req.cookies.token,'secret-key')
            req.user=data
            next();
        }
}


app.listen(4000,()=>{
    console.log("ok");
})