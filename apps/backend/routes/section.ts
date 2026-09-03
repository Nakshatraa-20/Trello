import express from "express";
import prisma from "db/client";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();


router.post("/post-section", async (req, res) => {
  const boardId = Number(req.body.boardId);
  const board = await prisma.boards.findUnique({ where: { id: boardId } });

  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: (req as any).userId, orgId: board.orgId },
  });

  if (!membership) {
    return res.status(403).json({ message: "Not a member of this organisation" });
  }

  const section = await prisma.section.create({
    data: { title: req.body.title, boardId },
  });

  return res.status(201).json({ section });
});

router.delete("/delete-section", async (req, res) => {
  const sectionId = Number(req.body.sectionId);
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { board: true },
  });

  if (!section) {
    return res.status(404).json({ message: "Section not found" });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: (req as any).userId, orgId: section.board.orgId, role: "admin" },
  });

  if (!membership) {
    return res.status(403).json({ message: "Admin access required" });
  }

  await prisma.section.delete({ where: { id: sectionId } });
  return res.status(204).send();
});

router.get("/:boardId", async (req, res) => {
  const boardId = Number(req.params.boardId);
  const board = await prisma.boards.findUnique({ where: { id: boardId } });

  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: (req as any).userId, orgId: board.orgId },
  });

  if (!membership) {
    return res.status(403).json({ message: "Not a member of this organisation" });
  }

  const sections = await prisma.section.findMany({ where: { boardId } });
  return res.json({ sections });
});

export default router;
