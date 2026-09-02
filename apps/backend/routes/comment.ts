import express from "express";
import prisma from "db/client";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();
router.use(authMiddleware);

router.post("/comment", async (req, res) => {
  const issueId = Number(req.body.issueId);
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

  const comment = await prisma.comment.create({
    data: {
      content: req.body.comment,
      userId: (req as any).userId,
      issueId,
    },
  });

  return res.status(201).json({ comment });
});

router.delete("/delete-comment", async (req, res) => {
  const commentId = Number(req.body.commentId);
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { issue: { include: { board: true } } },
  });

  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: (req as any).userId, orgId: comment.issue.board.orgId },
  });

  if (!membership) {
    return res.status(403).json({ message: "Not a member of this organisation" });
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return res.status(204).send();
});

export default router;
