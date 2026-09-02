import prisma from "db/client";
import express from "express";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();
router.use(authMiddleware);

router.post("/join-org", async (req, res) => {
  const userId = (req as any).userId;
  const orgId = Number(req.body.orgId);

  const org = await prisma.org.findUnique({ where: { id: orgId } });

  if (!org) {
    return res.status(404).json({ message: "Organisation not found" });
  }

  const existingMembership = await prisma.membership.findFirst({
    where: { userId, orgId },
  });

  if (existingMembership) {
    return res.status(409).json({ message: "Already a member" });
  }

  const membership = await prisma.membership.create({
    data: { userId, orgId, role: "member" },
  });

  return res.status(201).json({ membership });
});

export default router;
