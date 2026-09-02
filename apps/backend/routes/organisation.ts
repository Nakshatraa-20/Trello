import express from "express";
import prisma from "db/client";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();
router.use(authMiddleware);

router.post("/create-org", async (req, res) => {
  const organisation = await prisma.org.create({
    data: { name: req.body.name, description: req.body.description },
  });

  await prisma.membership.create({
    data: { userId: (req as any).userId, orgId: organisation.id, role: "admin" },
  });

  return res.status(201).json({ organisation });
});

router.get("/getorg", async (req, res) => {
  const memberships = await prisma.membership.findMany({
    where: { userId: (req as any).userId },
    include: { org: true },
  });

  return res.json({ memberships });
});

router.delete("/delete-org", async (req, res) => {
  const orgId = Number(req.body.orgId);
  const member = await prisma.membership.findFirst({
    where: { userId: (req as any).userId, orgId, role: "admin" },
  });

  if (!member) {
    return res.status(403).json({ message: "User cannot delete the organisation" });
  }

  await prisma.org.delete({ where: { id: orgId } });
  return res.status(204).send();
});

export default router;
