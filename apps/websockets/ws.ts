import { WebSocket, WebSocketServer } from "ws";



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



function broadcast(message: object) {
  connections.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  });
}

wss.on("connection", async (socket) => {

  connections.push(socket);

  socket.on("message", async (data) => {
    

        broadcast({
          type: "issue_added",
          issue: newIssue,
        });
      }

      if (parsedData.type === "delete_issue") {
        if (!parsedData.issueId) {
          return;
        }

       
        broadcast({
          type: "delete_issue",
          issueId: parsedData.issueId,
        });
      }

      if (parsedData.type === "move_issue") {
        if (!parsedData.issueId || !parsedData.sectionId) {
          return;
        }

       
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


