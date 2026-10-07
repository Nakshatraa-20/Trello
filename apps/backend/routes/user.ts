import express from "express";
import jwt from "jsonwebtoken";
import prisma from "db/client";
import bcrypt from "bcrypt";
import {randomInt} from "crypto"
import {Resend} from "resend"
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

  const verificationCode = randomInt(100000, 1000000).toString();
  const codeHash= await bcrypt.hash(verificationCode, 10)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.emailVerification.create({
    data: {
      codeHash,
      expiresAt,
      userId: user.id,
    },
  });

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Verify your email</h2>
      <p>Your verification code is:</p>
      <h1>${verificationCode}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });
  
  if (error) {
    console.error("Failed to send verification email:", error);
  
    return res.status(500).json({
      message: "Failed to send verification email",
    });
  }


  return res.status(201).json({
    message: "Account created. Please verify your email",
    user: { id: user.id, username: user.username },
  });
});

router.post("/verify-email", async(req, res)=>{
  const result= verifyEmailSchema.safeParse(req.body)
  if(!result.success){
    return res.status(400).json({
      message: "Invalid input",
    });
  }
  const { userId, code } = result.data
  const verification= await prisma.emailVerification.findUnique({
    where:{
      userId,
    }
  })
  if (!verification) {
    return res.status(400).json({
      message: "Verification code not found",
    });
}
if(verification.expiresAt< new Date()){
           return res.status(400).json({
            message:"Verification code has expired"
           })
}
const isCodeValid = await bcrypt.compare(
  code,
  verification.codeHash
);
if (!isCodeValid) {
  return res.status(400).json({
    message: "Invalid verification code",
  });
}

await prisma.user.update({
  where:{
    id:userId
  },
  data:{
    emailVerified:true,
  },
})

await prisma.emailVerification.delete({
  where:{
    
      userId,
    }
  })
  
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "JWT_SECRET is not configured",
    });
  }

  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET
  );

  return res.status(200).json({
    message: "Email verified successfully",
    token,
  });

  
  
})


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
