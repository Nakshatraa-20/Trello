import express from "express";
import jwt from "jsonwebtoken";
import prisma from "db/client";
import bcrypt from "bcrypt";
import { signinSchema, signupSchema } from "../validators/auth";

const router = express.Router();


router.post("/signup", async (req, res) => {
  const result = signupSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const { username, password,email } = result.data;
  const userExists = await prisma.user.findFirst({ 
    where:{
      OR:[
        {username: result.data.username},
        {email: result.data.email}
      ]}
    
   });

  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, password: hashedPassword,email },
  });

  return res.status(201).json({
    message: "User created successfully",
    user: { id: user.id, username: user.username },
  });
});

router.post("/signin", async (req, res) => {
  const result = signinSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "JWT_SECRET is not configured" });
  }

  const { identifier, password } = result.data;
  const user = await prisma.user.findFirst({ where: { OR:[{username: identifier},
    {email:identifier},
  ] } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  return res.json({ token });
});

export default router;
