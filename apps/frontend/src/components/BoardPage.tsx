import { useEffect, useState, useRef } from "react";
import Board from "./Board";
import Navbar from "./Navbar";
import {useParams} from "react-router-dom"

interface Issue {
  id: number;
  title: string;
  boardId: number;
  sectionId: number;
  completed: boolean 
}

interface Section {
  id: number;
  title: string;
  boardId: number;
}

function BoardPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const newSectionTitle = useRef<HTMLInputElement>(null);
  const {boardId} = useParams()

  const [issues, setIssues] = useState<Issue[]>([]);
  const [issueTitle, setIssueTitle] = useState<Record<number, string>>({});

  useEffect(() => {
    async function getSections() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3001/section/${boardId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        setSections(data.sections);
      } catch (error) {
        console.error("error fetching sections", error);
      }
    }
    getSections();

    async function getIssues() {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3001/issue/issues/board/${boardId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      setIssues(data.issues);
    }
    getIssues();
  }, [boardId]);

  async function createSection() {
    const title = newSectionTitle.current?.value;
    if(!title)
    {
      return
    }
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3001/section/post-section`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: title,
        boardId: Number(boardId),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(data.message);
      return;
    }

    setSections((prev) => [...prev, data.section]);
    newSectionTitle.current!.value = "";
  }

  async function createIssue(sectionId: number, title: string) {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3001/issue/create-issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: title,
        description: "",
        boardId: Number(boardId),
        sectionId: sectionId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data.message);
      return;
    }

    setIssues((prev) => [...prev, data.issue]);
    setIssueTitle((prev) => ({
        ...prev,
        [sectionId]: "",
      }));
  }
  async function deleteIssue(issueId: number) {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3001/issue/${issueId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data.message);
      return;
    }

    setIssues((prev) => prev.filter((issue) => issue.id !== issueId));
  }

  return (
    <div className="min-h-screen bg-paper text-ink font-handwritten">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>
      <Navbar />
      <Board
        newSectionTitle={newSectionTitle}
        createSection={createSection}
        sections={sections}
        issues={issues}
        createIssue={createIssue}
        deleteIssue={deleteIssue}
        setIssues= {setIssues}
      />
      <PageDecoration />
    </div>
  );
}

function PageDecoration() {
  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-10 h-52 w-52">
      <p className="absolute bottom-8 right-24 rotate-[-4deg] text-right font-handwritten text-2xl leading-7 text-ink-muted">
        Ideas<br />
        into<br />
        Impact
      </p>
      <svg
        aria-hidden="true"
        className="absolute bottom-3 right-3 h-44 w-24 opacity-80"
        viewBox="0 0 80 150"
        fill="none"
      >
        <path d="M37 145C39 112 40 73 43 28" stroke="#6f7158" strokeWidth="3" strokeLinecap="round" />
        <path d="M39 104C25 93 19 86 15 77C28 78 37 87 41 98" fill="#aab48c" stroke="#6f7158" strokeWidth="2" strokeLinejoin="round" />
        <path d="M40 82C53 68 61 62 69 62C66 76 57 86 42 91" fill="#aab48c" stroke="#6f7158" strokeWidth="2" strokeLinejoin="round" />
        <path d="M41 58C28 49 24 39 24 31C35 33 42 42 44 54" fill="#b9c59a" stroke="#6f7158" strokeWidth="2" strokeLinejoin="round" />
        <path d="M43 37C47 25 54 18 61 15C61 27 55 36 45 42" fill="#b9c59a" stroke="#6f7158" strokeWidth="2" strokeLinejoin="round" />
        <path d="M43 28C34 22 31 13 34 5C40 8 44 14 44 23" fill="#f6d9a6" stroke="#805f45" strokeWidth="2" strokeLinejoin="round" />
        <path d="M44 27C44 15 49 7 55 5C58 13 55 22 47 29" fill="#f6d9a6" stroke="#805f45" strokeWidth="2" strokeLinejoin="round" />
        <path d="M45 28C52 22 61 21 67 25C62 33 53 36 45 32" fill="#f6d9a6" stroke="#805f45" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="45" cy="29" r="4" fill="#c78352" />
      </svg>
    </div>
  );
}

export default BoardPage;
