import express from "express";
import prisma from "db/client";
import { authMiddleware } from "../middleware/auth";
import { getOrderedIssueIds } from "../lib/issue-order";

const router = express.Router();
router.use(authMiddleware); 
async function notifyBoard(
  boardId: number,
  type:
    | "issue_created"
    | "issue_deleted"
    | "issue_moved"
    | "issue_updated",
  payload: Record<string, unknown>,
) {
  try {
    const response = await fetch(
      "http://localhost:3002/broadcast",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          room: `board-${boardId}`,
          payload,
        }),
        signal: AbortSignal.timeout(3000),
      },
    );

    if (!response.ok) {
      console.error(
        "Board notification failed:",
        response.status,
      );
    }
  } catch (error) {
    console.error("Could not reach WebSocket server:", error);
  }
}

async function retryOnConflict<T>(
  operation: () => Promise<T>
): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isConflict =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2034";

      if (!isConflict || attempt === 2) {
        throw error;
      }
    }
  }

  throw new Error("Could not complete the database operation.");
}

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
  const issue = await retryOnConflict(() =>
    prisma.$transaction(
      async (tx) => {
        // Find the highest position in this section.
        const lastIssue = await tx.issue.findFirst({
          where: {
            sectionId,
          },
          orderBy: {
            position: "desc",
          },
          select: {
            position: true,
          },
        });
  
        // Empty section starts at 0.
        const nextPosition = (lastIssue?.position ?? -1) + 1;
  
        return tx.issue.create({
          data: {
            title: req.body.title,
            description: req.body.description,
            boardId,
            sectionId,
            position: nextPosition,
          },
        });
      },
      {
        isolationLevel: "Serializable",
      }
    )
  );
  await notifyBoard(issue.boardId,"issue_created",{issue})
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

  

  await prisma.issue.delete({
    where: { id: issueId },
  });
  await notifyBoard(issue.boardId,"issue_deleted",{issueId})
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
  const beforeIssueId: number | null =
    req.body.beforeIssueId ?? null;

  if (
    !Number.isSafeInteger(issueId) ||
    issueId <= 0 ||
    !Number.isSafeInteger(sectionId) ||
    sectionId <= 0
  ) {
    return res.status(400).json({
      message: "Issue ID and section ID must be positive integers.",
    });
  }

  if (
    beforeIssueId !== null &&
    (
      !Number.isSafeInteger(beforeIssueId) ||
      beforeIssueId <= 0
    )
  ) 
    return res.status(400).json({
      message: "beforeIssueId must be a positive integer or null.",
    });

  /*const issue= await prisma.issue.findUnique({
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
          }); */
          try {
            const result = await retryOnConflict(() =>
              prisma.$transaction(
                async (tx) => {
                  // 1. Read the issue and check access to its board.
                  const issue = await tx.issue.findUnique({
                    where: { id: issueId },
                    include: { board: true },
                  });
        
                  if (!issue) {
                    return {
                      status: 404 as const,
                      message: "Issue not found",
                    };
                  }
        
                  const { board, ...movingIssue } = issue;
                  const userId = (req as any).userId;
        
                  if (board.orgId === null) {
                    if (board.userId !== userId) {
                      return {
                        status: 403 as const,
                        message: "You do not have access to this board",
                      };
                    }
                  } else {
                    const membership = await tx.membership.findFirst({
                      where: { userId, orgId: board.orgId },
                    });
        
                    if (!membership) {
                      return {
                        status: 403 as const,
                        message: "Not a member of this organisation",
                      };
                    }
                  }
        
                  // 2. Check the destination section.
                  const destination = await tx.section.findUnique({
                    where: { id: sectionId },
                  });
        
                  if (!destination || destination.boardId !== issue.boardId) {
                    return {
                      status: 400 as const,
                      message: "Destination section must belong to this board",
                    };
                  }
        
                  // Dropping an issue onto itself changes nothing.
                  if (beforeIssueId === issueId) {
                    if (sectionId !== issue.sectionId) {
                      return {
                        status: 400 as const,
                        message: "Cannot insert an issue before itself in another section",
                      };
                    }
        
                    return {
                      status: 200 as const,
                      issues: [movingIssue],
                    };
                  }
        
                  // 3. Read the issues from both affected sections.
                  const affectedSectionIds = [
                    ...new Set([issue.sectionId, sectionId]),
                  ];
        
                  const affectedIssues = await tx.issue.findMany({
                    where: {
                      boardId: issue.boardId,
                      sectionId: { in: affectedSectionIds },
                    },
                    orderBy: [
                      { position: "asc" },
                      { id: "asc" },
                    ],
                  });
        
                  const destinationIssues = affectedIssues.filter(
                    (item) => item.sectionId === sectionId,
                  );
        
                  // The target may have moved since the drag started.
                  if (
                    beforeIssueId !== null &&
                    !destinationIssues.some(
                      (item) => item.id === beforeIssueId,
                    )
                  ) {
                    return {
                      status: 409 as const,
                      message: "The target issue moved. Refresh and try again.",
                    };
                  }
        
                  // 4. Calculate the destination's new order.
                  const destinationIds = getOrderedIssueIds(
                    destinationIssues,
                    issueId,
                    beforeIssueId,
                  );
        
                  // 5. Save each issue's array index as its position.
                  for (const [position, id] of destinationIds.entries()) {
                    await tx.issue.update({
                      where: { id },
                      data: {
                        sectionId,
                        position,
                      },
                    });
                  }
        
                  // 6. Close the gap in the old section for cross-section moves.
                  if (issue.sectionId !== sectionId) {
                    const remainingSourceIssues = affectedIssues.filter(
                      (item) =>
                        item.sectionId === issue.sectionId &&
                        item.id !== issueId,
                    );
        
                    for (
                      const [position, item]
                      of remainingSourceIssues.entries()
                    ) {
                      await tx.issue.update({
                        where: { id: item.id },
                        data: { position },
                      });
                    }
                  }
        
                  // 7. Return the saved rows from both sections.
                  const updatedIssues = await tx.issue.findMany({
                    where: {
                      boardId: issue.boardId,
                      sectionId: { in: affectedSectionIds },
                    },
                    orderBy: [
                      { sectionId: "asc" },
                      { position: "asc" },
                      { id: "asc" },
                    ],
                  });
        
                  return {
                    status: 200 as const,
                    issues: updatedIssues,
                  };
                },
                { isolationLevel: "Serializable" },
              ),
            );
        
            if (result.status !== 200) {
              return res.status(result.status).json({
                message: result.message,
              });
            }
        
            return res.status(200).json({
              message: "Issue moved successfully",
              issue: result.issues.find((item) => item.id === issueId),
              issues: result.issues,
            });
          } catch (error) {
            console.error("Could not move issue:", error);
        
            const isConflict =
              typeof error === "object" &&
              error !== null &&
              "code" in error &&
              error.code === "P2034";
        
            return res.status(isConflict ? 409 : 500).json({
              message: isConflict
                ? "The board changed during the move. Please try again."
                : "Could not move the issue.",
            });
          }
        });         
  

export default router;
