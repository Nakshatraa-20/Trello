import "./index.css";
import { useEffect, useState } from "react";

interface Issue {
  id: number;
  title: string;
  boardId: number;
  sectionId: number;
}

export function App() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3002");

    setWs(ws);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onerror = () => {
      console.error("WebSocket connection failed");
    };

    ws.onmessage = (event) => {
      const data = event.data;
      const parsedData = JSON.parse(data);

      console.log("parsed data FE", parsedData)

      if (parsedData.type === "initial_state") {
        setIssues(parsedData.issues);
      }

      if (parsedData.type === "issue_added") {
        setIssues((issues) => [...issues, parsedData.issue]);
      }

      if (parsedData.type === "delete_issue") {
        setIssues((issues) =>
          issues.filter((issue) => issue.id !== parsedData.issueId),
        );
      }

      if (parsedData.type === "issue_moved") {
        setIssues((issues) =>
          issues.map((issue) =>
            issue.id === parsedData.issue.id
              ? parsedData.issue
              : issue,
          ),
        );
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div style={{ display: "flex", gap: 20 }}>
      <div style={{ flex: 1 }}>
        <h3>Todo</h3>

        <input
          id="todo_input"
          type="text"
          placeholder="Issue title"
        />

        <button
          onClick={() => {
            const input = document.getElementById(
              "todo_input",
            ) as HTMLInputElement;

            if (ws?.readyState === WebSocket.OPEN && input.value.trim()) {
              ws.send(JSON.stringify({
                type: "issue_added",
                title: input.value,
                boardId: 1,
                sectionId: 1,
                description:""
              }));
            }

            input.value = "";
          }}
        >
          Add issue
        </button>

        {issues
          .filter((issue) => issue.sectionId === 1)
          .map((issue) => (
            <Card
              key={issue.id}
              id={issue.id}
              title={issue.title}
              ws={ws}
            />
          ))}
      </div>

      <div style={{ flex: 1 }}>
        <h3>In progress</h3>

        <input
          id="Inprogress_input"
          type="text"
          placeholder="Issue title"
        />

        <button
          onClick={() => {
            const input = document.getElementById(
              "Inprogress_input",
            ) as HTMLInputElement;

            if (ws?.readyState === WebSocket.OPEN && input.value.trim()) {
              ws.send(JSON.stringify({
                type: "issue_added",
                title: input.value,
                boardId: 1,
                sectionId: 2,
                description:""
              }));
            }

            input.value = "";
          }}
        >
          Add issue
        </button>

        {issues
          .filter((issue) => issue.sectionId === 2)
          .map((issue) => (
            <Card
              key={issue.id}
              id={issue.id}
              title={issue.title}
              ws={ws}
            />
          ))}
      </div>

      <div style={{ flex: 1 }}>
        <h3>Done</h3>

        <input
          id="done_input"
          type="text"
          placeholder="Issue title"
        />

        <button
          onClick={() => {
            const input = document.getElementById(
              "done_input",
            ) as HTMLInputElement;

            if (ws?.readyState === WebSocket.OPEN && input.value.trim()) {
              ws.send(JSON.stringify({
                type: "issue_added",
                title: input.value,
                boardId: 1,
                sectionId: 3,
                description:""
              }));
            }

            input.value = "";
          }}
        >
          Add issue
        </button>

        {issues
          .filter((issue) => issue.sectionId === 3)
          .map((issue) => (
            <Card
              key={issue.id}
              id={issue.id}
              title={issue.title}
              ws={ws}
            />
          ))}
      </div>
    </div>
  );
}

function Card({
  title,
  ws,
  id,
}: {
  title: string;
  ws: WebSocket | null;
  id: number;
}) {
  return (
    <div
      style={{
        border: "1px solid black",
        padding: 20,
        margin: 20,
      }}
    >
      <p>{title}</p>

      <button
        onClick={() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: "delete_issue",
              issueId: id,
            }));
          }
        }}
      >
        Delete
      </button>
    </div>
  );
}

export default App;
