interface Issue {
  id: number;
  title: string;
  boardId: number;
  sectionId: number;
  description: string;
}

interface BroadcastMessage {
  type:
    | "issue_created"
    | "issue_deleted"
    | "issue_moved"
    | "issue_updated";

  room: string;

  payload: {
    issue?: Issue;
    issueId?: number;
  };
}

interface SocketConnection {
  socket: ServerWebSocket<unknown>;
  room: string;
}

const allSockets: SocketConnection[] = [];

function broadcast(room: string, message: BroadcastMessage) {
  const parsedMessage = JSON.stringify(message);

  for (let i = 0; i < allSockets.length; i++) {
    if (allSockets[i].room === room) {
      allSockets[i].socket.send(parsedMessage);
    }
  }
}

const server = Bun.serve({
  port: 3002,

  async fetch(req, server) {
    const url = new URL(req.url);

    // Backend → WebSocket server
    if (req.method === "POST" && url.pathname === "/broadcast") {
      try {
        const message = (await req.json()) as BroadcastMessage;

        console.log("Broadcast message:", message);

        broadcast(message.room, message);

        return Response.json({
          success: true,
        });
      } catch (error) {
        console.error("Broadcast failed:", error);

        return Response.json(
          {
            success: false,
            message: "Invalid broadcast message",
          },
          {
            status: 400,
          }
        );
      }
    }

    // Frontend → WebSocket connection
    if (url.pathname === "/ws") {
      const room = url.searchParams.get("room");

      if (!room) {
        return new Response("Room is required", {
          status: 400,
        });
      }

      const upgraded = server.upgrade(req, {
        data: {
          room,
        },
      });

      if (upgraded) {
        return;
      }

      return new Response("WebSocket upgrade failed", {
        status: 500,
      });
    }

    return new Response("Not Found", {
      status: 404,
    });
  },

  websocket: {
    open(socket) {
      const room = socket.data.room as string;

      console.log(`Client connected to room: ${room}`);

      allSockets.push({
        socket,
        room,
      });
    },

    message(socket, message) {
      console.log("Message from client:", message);

      // We don't perform issue CRUD here.
      // CRUD is handled by your HTTP backend.
    },

    close(socket) {
      const index = allSockets.findIndex(
        (connection) => connection.socket === socket
      );

      if (index !== -1) {
        allSockets.splice(index, 1);
      }

      console.log("Client disconnected");
    },
  },
});

console.log(
  `WebSocket server running on ws://localhost:${server.port}/ws`
);

console.log(
  `Broadcast endpoint: http://localhost:${server.port}/broadcast`
);