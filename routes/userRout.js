const express = require('express')
const userRouter = express.Router()
const {User, Admin, Projects,Tasks} = require("../db/connect")
const {SECRETKEY} = require("../config")
const z = require("zod");
const jwt = require('jsonwebtoken');
const userAuth = require("../middlewares/userAuth")

const userSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  password: z.string(),
})

userRouter.post("/signup", async(req,res)=>{
  const { success } = userSchema.safeParse(req.body)
  if(!success) return res.status(411).json({msg: "not a valid input"})

  const finduser = await User.findOne({email: req.body.email})
  const findadmin = await Admin.findOne({email: req.body.email})
  if(finduser || findadmin) return res.status(411).json({msg: "user already exists"})

  const user = await User.create({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password
  })
  if(!user) return res.status(411).json({msg: "issue with the DB"})
  const token  = jwt.sign({userId: user._id}, SECRETKEY)
  res.status(200).json({msg :"user created", token: token});
})

const userUpdateSchema = z.object({
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
})
userRouter.post('/userUpdate',userAuth, async(req,res)=>{
  const filter = { _id: req.userId };
  const update = req.body;
  const { success } = userUpdateSchema.safeParse(req.body);
  if(!success) return res.status(411).json({msg: "not a valid input"})

  let doc = await User.findOneAndUpdate(filter, update);
  if(!doc) return res.status(411).json({msg: "issue with the DB"})
  res.status(200).json({msg :"user Updated"});
})
userRouter.get("/signin", async(req,res)=>{
  const find = await User.findOne({email: req.headers.email, password: req.headers.password})
  if(!find) return res.status(411).json({mssg : "wrong credentials"})
 
  const token  = jwt.sign({userId: find._id}, SECRETKEY)
  res.status(200).json({msg :"loggen in", token: token});
})

userRouter.get("/projects",userAuth, async(req,res)=>{
  const projects = await Projects.find({});

  if(!projects) return res.status(411).json({msg: "error looking for projects"});

  res.status(200).send(projects)
})

userRouter.get('/project', userAuth, async(req,res)=>{
  const projectId = req.query.projectId;
  const project = await Projects.findById(projectId);

  if(!project) return res.status(411).json({msg: "invalid id"});

  res.status(200).send(project)
})
userRouter.get('/tasksInProject', userAuth, async(req, res)=>{
  const projectId = req.query.projectId;

  const tasks = await Tasks.find({userId: projectId});

  if(!tasks) return res.status(411).json({msg: "wrong id"});

  res.status(200).send(tasks)
});

userRouter.get("/tasks",userAuth, async(req,res)=>{
  const tasks = await Tasks.find({});
  if(!tasks) return res.status(411).json({msg: "error looking for tasks"});
  res.status(200).send(tasks)
})
userRouter.post("/taskcomplete", userAuth, async(req,res)=>{
  const filter = { _id: req.body.taskId };
  const update = { status: true };

  let doc = await Tasks.findOneAndUpdate(filter, update);
  if(!doc) return res.status(411).json({msg: "issue with the DB"})
  res.status(200).json({msg :"Task Completed"});
})
userRouter.get('/tasksInUser', userAuth, async(req, res)=>{
  const userId = req.userId;

  const tasks = await Tasks.find({assigTo: userId});

  if(!tasks) return res.status(411).json({msg: "wrong id"});

  res.status(200).send(tasks)
});

userRouter.get('/projectbyid',userAuth, async(req, res)=>{
  const projectId = req.query.projectId
  const projectById = await Projects.findById(projectId)

  if(!projectById) return res.status(411).json({msg: "invalid id"});

  res.status(200).send(projectById);
});
userRouter.get('/getuser',userAuth, async(req, res)=>{
  const userId = req.userId;
  const user = await User.findById(userId);

  if(!user) return res.status(411).json({msg: "invalid id"});

  res.status(200).send(user)
});

userRouter.get('/getUsers',userAuth, async(req, res)=>{
  const users = await User.find({});

  if(!users) return res.status(411).json({msg: "invalid id"});

  res.status(200).send(users);
})
userRouter.get('/tasks/get')
module.exports = userRouter;