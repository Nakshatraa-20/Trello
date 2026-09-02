import express from "express";
import prisma from "db/client";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();
router.use(authMiddleware);

router.post("/board-post", async (req, res) => {
  const orgId = Number(req.body.orgId);
  const membership = await prisma.membership.findFirst
  ({
    where: 
    { orgId, 
    userId: (req as any).userId },
  });

  if (!membership) {
    return res.status(403).json({ message: "Not a member of the organisation" });
  }

  const board = await prisma.boards.create({
    data: 
    { 
      title: req.body.title, 
      orgId 
   },
  });

  return res.status(201).json({ board });
});

router.get("/boards", async (req, res) => {
  const orgId = Number(req.query.orgId);
  const membership = await prisma.membership.findFirst
  ({
    where: 
    { orgId, 
      userId: (req as any).userId },
  });

  if (!membership) {
    return res.status(403).json
    ({ message: "Not a member of the organisation" });
  }

  const boards = await prisma.boards.findMany
  ({ where: 
   { orgId } });
  return res.json({ boards });
});

router.delete("/board-delete", async (req, res) => {
  const boardId = Number(req.body.boardId);
  const board = await prisma.boards.findUnique
  ({ where: 
   { id: boardId } });

  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  const membership = await prisma.membership.findFirst({
    where: { orgId: board.orgId, userId: (req as any).userId, role: "admin" },
  });

  if (!membership) {
    return res.status(403).json({ message: "Admin access required" });
  }

  await prisma.boards.delete({ where: { id: boardId } });
  return res.status(204).send();
});

export default router;
