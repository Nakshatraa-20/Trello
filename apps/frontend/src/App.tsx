import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import { SignupForm } from "./components/signup-form";
import { LoginForm } from "./components/login-form";
import { VerifyEmailForm } from "./components/verify-email-form";
import BoardPage from "./components/BoardPage";
import WorkspacePage from "./components/WorkspacePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/verify-email" element={<VerifyEmailForm />} />
        <Route path="/board/:boardId" element={<BoardPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workspace/:orgId" element={<WorkspacePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
