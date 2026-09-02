import express from "express";
import prisma from "db/client";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();
router.use(authMiddleware);

router.post("/create-issue", async (req, res) => {
  const boardId = Number(req.body.boardId);
  const sectionId = Number(req.body.sectionId);
  const board = await prisma.boards.findUnique({ where: { id: boardId } });
  const section = await prisma.section.findUnique({ where: { id: sectionId } });

  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  if (!section || section.boardId !== board.id) {
    return res.status(400).json({ message: "Section does not belong to this board" });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: (req as any).userId, orgId: board.orgId },
  });

  if (!membership) {
    return res.status(403).json({ message: "Not a member of this organisation" });
  }

  const issue = await prisma.issue.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      boardId,
      sectionId,
    },
  });

  return res.status(201).json({ issue });
});

router.get("/issues/board/:boardId", async (req, res) => {
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

  const issues = await prisma.issue.findMany({ where: { boardId } });
  return res.json({ issues });
});

router.get("/issues/section/:sectionId", async (req, res) => {
  const sectionId = Number(req.params.sectionId);
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { board: true },
  });

  if (!section) {
    return res.status(404).json({ message: "Section not found" });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: (req as any).userId, orgId: section.board.orgId },
  });

  if (!membership) {
    return res.status(403).json({ message: "Not a member of this organisation" });
  }

  const issues = await prisma.issue.findMany({ where: { sectionId } });
  return res.json({ issues });
});

router.get("/issue/:issueId", async (req, res) => {
  const issueId = Number(req.params.issueId);
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { board: true },
  });

  if (!issue) {
    return res.status(404).json({ message: "Issue not found" });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: (req as any).userId, orgId: issue.board.orgId },
  });

  if (!membership) {
    return res.status(403).json({ message: "Not a member of this organisation" });
  }

  return res.json({ issue });
});

export default router;
