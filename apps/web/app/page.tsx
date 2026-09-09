'use client';

import { useState, useRef } from "react";
import {
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  FileUp,
  GitBranch,
  GraduationCap,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
  X,
} from "lucide-react";

const agents = [
  { name: "AI Content Studio", icon: BookOpenCheck, tone: "green" },
  { name: "Workforce Skills", icon: UsersRound, tone: "teal" },
  { name: "Skills & Standards", icon: GraduationCap, tone: "orange" },
  { name: "Accessibility Audit", icon: ShieldCheck, tone: "blue" },
  { name: "Knowledge Intelligence", icon: BrainCircuit, tone: "indigo" },
];

const defaultPrompt = "Create a standards-aligned learning module from the uploaded curriculum source. Include accessibility checks and workforce skill mapping.";
const apiUrl = process.env.NEXT_PUBLIC_PLATFORM_API_URL ?? "http://localhost:8000/api/v1";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
}

export default function Home() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<{ summary?: string; recommendations?: string[] } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${apiUrl}/files/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`File upload failed with status ${response.status}`);
      }

      const data = await response.json();
      const newFile: UploadedFile = {
        id: data.file_id || data.id || Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
      };
      setUploadedFiles((prev) => [...prev, newFile]);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "File upload failed");
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (files) {
      Array.from(files).forEach((file) => uploadFile(file));
    }
    e.currentTarget.value = "";
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach((file) => uploadFile(file));
    }
  }

  function removeFile(fileId: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }

  function toggleAgent(agentName: string) {
    setSelectedAgents((prev) =>
      prev.includes(agentName)
        ? prev.filter((a) => a !== agentName)
        : [...prev, agentName]
    );
  }

  async function handleRunWorkflow() {
    setIsRunning(true);
    setStatus("Running workflow...");
    setResult(null);

    try {
      const response = await fetch(`${apiUrl}/workflows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          use_case: "course-content-blueprint",
          prompt,
          selected_agents: selectedAgents,
          source_file_ids: uploadedFiles.map((f) => f.id),
          parameters: { topic: "course content" },
        }),
      });

      if (!response.ok) {
        throw new Error(`Workflow request failed with status ${response.status}`);
      }

      const data = await response.json();
      setStatus(`Workflow status: ${data.status}`);
      setResult(data.result ?? null);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Workflow request failed");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <main className="shell">
      <aside className="sidebar" aria-label="Platform navigation">
        <div className="brand">
          <div className="brandMark">A</div>
          <div>
            <strong>Academian</strong>
            <span>Agentic Platform</span>
          </div>
        </div>
        <nav>
          <a className="active" href="#workflow"><GitBranch size={18} />Workflow</a>
          <a href="#files"><FileUp size={18} />Files</a>
          <a href="#config"><SlidersHorizontal size={18} />Configuration</a>
          <a href="#results"><BarChart3 size={18} />Results</a>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">MVP workspace</p>
            <h1>Course-content workflow orchestration</h1>
          </div>
          <div className="apiPill">API: {apiUrl}</div>
        </header>

        <section className="builder" id="workflow">
          <div className="panel primaryPanel">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Workflow builder</p>
                <h2>Author, route, review, publish</h2>
              </div>
              <button type="button" onClick={handleRunWorkflow} disabled={isRunning}>
                {isRunning ? "Running..." : "Run workflow"}
              </button>
            </div>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
            <div className="flowSteps">
              <span>Blueprint</span>
              <span>Knowledge retrieval</span>
              <span>Agent routing</span>
              <span>Human approval</span>
            </div>
          </div>

          <div className="panel uploadPanel" id="files">
            <p className="eyebrow">Files & documents</p>
            <div
              className={`uploadTarget ${isDragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <FileUp size={28} />
              <strong>Drop curriculum files</strong>
              <span>PDF, DOCX, CSV, JSON, images, and web URLs</span>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="uploadedFilesList">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="uploadedFileItem">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="removeFileBtn"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="agentGrid" aria-label="Domain agents">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isSelected = selectedAgents.includes(agent.name);
            return (
              <article
                className={`agentCard ${agent.tone} ${isSelected ? "selected" : ""}`}
                key={agent.name}
                onClick={() => toggleAgent(agent.name)}
                role="button"
                tabIndex={0}
              >
                {isSelected && <CheckCircle2 size={20} className="checkmark" />}
                <Icon size={24} />
                <h3>{agent.name}</h3>
                <p>Connected to the shared knowledge context and orchestrated by LangGraph.</p>
              </article>
            );
          })}
        </section>

        <section className="statusBand" id="results">
          <div>
            <p className="eyebrow">Results monitor</p>
            <h2>Shared status for content, compliance, cost, and decisions</h2>
          </div>
          <div className="statusList">
            <span><CheckCircle2 size={18} />SQLite workflow run persistence</span>
            <span><CheckCircle2 size={18} />LangGraph orchestration shell</span>
            <span><CheckCircle2 size={18} />Human review checkpoint planned</span>
          </div>
          {status && <p className="statusText">{status}</p>}
          {result && (
            <div className="resultCard">
              <strong>{result.summary ?? "Workflow complete"}</strong>
              {result.recommendations && (
                <ul>
                  {result.recommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
