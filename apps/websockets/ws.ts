import { WebSocket, WebSocketServer } from "ws";
import prisma from "db/client";
import "dotenv/config"


interface Issue {
  id: number;
  title: string;
  boardId: number;
  sectionId: number;
  description: string
}

interface ClientMessage {
  type: "issue_added" | "delete_issue" | "move_issue";
  title?: string;
  boardId?: number;
  sectionId?: number;
  issueId?: number;
  description?: string;
}

const wss = new WebSocketServer({ port: 3002 });
const connections: WebSocket[] = [];

//check 
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

function broadcast(message: object) {
  connections.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  });
}

wss.on("connection", async (socket) => {

  connections.push(socket);

  try {
    const issues: Issue[] = await prisma.issue.findMany();

    console.log("issues in ws", issues)

    socket.send(JSON.stringify({
      type: "initial_state",
      issues,
    }));
  } catch (error) {
    console.error("Could not load initial issues", error);
    socket.send(JSON.stringify({
      type: "error",
      message: "Could not load issues",
    }));
  }

  socket.on("message", async (data) => {
    try {
      const parsedData = JSON.parse(data.toString()) as ClientMessage;

      console.log("parsedData ws", parsedData)

      if (parsedData.type === "issue_added") {
        if (!parsedData.title || !parsedData.boardId || !parsedData.sectionId) {
          return;
        }

        const newIssue = await prisma.issue.create({
          data: {
            title: parsedData.title,
            boardId: parsedData.boardId,
            sectionId: parsedData.sectionId,
            description: parsedData.description ?? "",
          },
        });

        broadcast({
          type: "issue_added",
          issue: newIssue,
        });
      }

      if (parsedData.type === "delete_issue") {
        if (!parsedData.issueId) {
          return;
        }

        await prisma.issue.delete({
          where: { id: parsedData.issueId },
        });

        broadcast({
          type: "delete_issue",
          issueId: parsedData.issueId,
        });
      }

      if (parsedData.type === "move_issue") {
        if (!parsedData.issueId || !parsedData.sectionId) {
          return;
        }

        const updatedIssue = await prisma.issue.update({
          where: { id: parsedData.issueId },
          data: { sectionId: parsedData.sectionId },
        });

        broadcast({
          type: "issue_moved",
          issue: updatedIssue,
        });
      }
    } catch (error) {
      console.error("WebSocket message failed", error);

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Could not process message",
        }));
      }
    }
  });

  socket.on("close", () => {
    const index = connections.indexOf(socket);

    if (index !== -1) {
      connections.splice(index, 1);
    }
  });
});

wss.on("listening", () => {
  console.log("WebSocket server running on ws://localhost:3002");
});

wss.on("error", (error) => {
  console.error("WebSocket server failed to start", error);
});
