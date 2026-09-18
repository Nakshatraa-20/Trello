import express from "express";
import prisma from "db/client";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();
router.use(authMiddleware); 

router.post("/create-issue", async (req, res) => {
  const boardId = Number(req.body.boardId);
  const sectionId = Number(req.body.sectionId);
  const board = await prisma.boards.findUnique({ where: { id: boardId } })
  
  const section = await prisma.section.findUnique({ where: { id: sectionId } });

  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  if (!section || section.boardId !== board.id) {
    return res.status(400).json({ message: "Section does not belong to this board" });
  }

  if (board.orgId === null) {
     if (board.userId !== (req as any).userId) {
      return res.status(403).json({
        message: "You do not have access to this board",
      });
    }
  } else {
    const membership = await prisma.membership.findFirst({
      where: {
        userId: (req as any).userId,
        orgId: board.orgId,
      },
    });
  
    if (!membership) {
      return res.status(403).json({
        message: "Not a member of this organisation",
      });
    }
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
  console.log("PARAM:", req.params.boardId);
  console.log("BOARD ID:", boardId);

  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  if (board.orgId === null) {
    if (board.userId !== (req as any).userId) {
      return res.status(403).json({
        message: "You do not have access to this board",
      });
    }
  } else {
    const membership = await prisma.membership.findFirst({
      where: {
        userId: (req as any).userId,
        orgId: board.orgId,
      },
    });
  
    if (!membership) {
      return res.status(403).json({
        message: "Not a member of this organisation",
      });
    }
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

router.get("/issue/:issueId", async (req, res) => {
  const issueId = Number(req.params.issueId);
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { board: true },
  });

  if (!issue) {
    return res.status(404).json({ message: "Issue not found" });
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

  return res.json({ issue });
});

router.delete("/:issueId", async (req, res) => {
  const issueId = Number(req.params.issueId);

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { board: true },
  });

  if (!issue) {
    return res.status(404).json({
      message: "Issue not found",
    });
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

  await prisma.issue.delete({
    where: { id: issueId },
  });

  return res.status(200).json({
    message: "Issue deleted successfully",
  });
});

router.patch("/:issueId/completed", async(req,res)=>{
const issueId= Number(req.params.issueId)
const completed= req.body.completed

const issue= await prisma.issue.update({
  where: {
    id: issueId
  },
  data:{
    completed:completed
  }
})

res.json({issue})

}
)

router.patch("/:issueId/move", async(req,res)=> {
  const issueId= Number(req.params.issueId)
  const sectionId= Number(req.body.sectionId)

  const issue= await prisma.issue.findUnique({
    where:
    {
      id:issueId
    }
    })
    if(!issue){
      return res.status(403).json({
        message:"Issue not found"
      })
    }
    const section= await prisma.section.findUnique({
      where:{
        id: sectionId
      }
    })
    if (!section) {
      return res.status(404).json({
        message: "Section not found",
      });
    }
    if (issue.boardId !== section.boardId) {
      return res.status(400).json({
        message: "Cannot move issue to a section from another board",
      });
    }
            const updateIssue= await prisma.issue.update({
              where:{
                id:issueId,
              },
              data:{
                sectionId: sectionId
              }
            })
            return res.status(200).json({
              message: "Issue moved successfully",
              issue: updateIssue,
            });
          });
  

export default router;
