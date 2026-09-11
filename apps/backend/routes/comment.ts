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

  if (issue.board.orgId === null) {
    if (issue.board.userId !== (req as any).userId) {
      return res.status(403).json({ message: "You cannot delete this board" });
    }
  } else {
    const membership = await prisma.membership.findFirst({
      where: {
        orgId: issue.board.orgId,
        userId: (req as any).userId,
        role: "admin",
      },
    });
  
    if (!membership) {
      return res.status(403).json({ message: "Admin access required" });
    }
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

  router.get("/issues/section/:sectionId", async (req, res) => {
    const sectionId = Number(req.params.sectionId);
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { board: true },
    });
  
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }
  
    if (section.board.orgId === null) {
      if (section.board.userId !== (req as any).userId) {
        return res.status(403).json({
          message: "You do not have access to this board",
        });
      }
    } else {
      const membership = await prisma.membership.findFirst({
        where: {
          userId: (req as any).userId,
          orgId: section.board.orgId,
        },
      });
    
      if (!membership) {
        return res.status(403).json({
          message: "Not a member of this organisation",
        });
      }
    }
  
    const issues = await prisma.issue.findMany({ where: { sectionId } });
    return res.json({ issues });
  });

  await prisma.comment.delete({ where: { id: commentId } });
  return res.status(204).send();
});

export default router;
