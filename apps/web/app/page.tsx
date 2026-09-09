'use client';

import { useState, useRef } from "react";
import {
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileUp,
  GitBranch,
  GraduationCap,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
  ThumbsUp,
  UsersRound,
  X,
} from "lucide-react";

const agents = [
  {
    name: "AI Content Studio",
    key: "ai-content-studio",
    icon: BookOpenCheck,
    tone: "green",
    description: "Generates standards-aligned course blueprints and learning materials",
    inputs: ["Curriculum files", "Course objectives", "Target audience level"],
    outputs: ["Course structure", "Module outlines", "Learning objectives", "Content recommendations"],
  },
  {
    name: "Workforce Skills",
    key: "workforce-skills",
    icon: UsersRound,
    tone: "teal",
    description: "Maps course content to in-demand workforce competencies",
    inputs: ["Course content", "Skills taxonomy", "Industry standards"],
    outputs: ["Skills mapping", "Competency alignment", "Labor market relevance", "Career pathways"],
  },
  {
    name: "Skills & Standards",
    key: "skills-standards-intelligence",
    icon: GraduationCap,
    tone: "orange",
    description: "Validates alignment with institutional standards and accreditation requirements",
    inputs: ["Learning outcomes", "Standards frameworks", "Accreditation criteria"],
    outputs: ["Standards compliance report", "Gap analysis", "Alignment score", "Remediation suggestions"],
  },
  {
    name: "Accessibility Audit",
    key: "accessibility-audit-remediation",
    icon: ShieldCheck,
    tone: "blue",
    description: "Ensures content meets WCAG accessibility guidelines",
    inputs: ["Course materials", "Media files", "Interactive elements"],
    outputs: ["Accessibility audit report", "WCAG compliance score", "Remediation checklist", "Best practices"],
  },
  {
    name: "Knowledge Intelligence",
    key: "knowledge-intelligence",
    icon: BrainCircuit,
    tone: "indigo",
    description: "Extracts insights and recommends knowledge base connections",
    inputs: ["Course content", "Knowledge base", "Learning analytics"],
    outputs: ["Knowledge graph", "Recommended resources", "Related topics", "Learning insights"],
  },
];

const defaultPrompt = "Create a standards-aligned learning module from the uploaded curriculum source. Include accessibility checks and workforce skill mapping.";
const apiUrl = process.env.NEXT_PUBLIC_PLATFORM_API_URL ?? "http://localhost:8000/api/v1";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
}

interface AgentResult {
  agent: string;
  status: string;
  output: Record<string, unknown>;
}

interface WorkflowResult {
  summary: string;
  agent_results: AgentResult[];
  recommendations: string[];
}

interface KnowledgeBaseItem {
  id: string;
  title: string;
}

interface KnowledgeBaseGroup {
  group: string;
  items: KnowledgeBaseItem[];
}

const workflowSteps = [
  { id: 1, title: "Workflow", icon: "🔀" },
  { id: 2, title: "Upload Files", icon: "📤" },
  { id: 3, title: "Select Agents", icon: "⚙️" },
  { id: 4, title: "Run & Results", icon: "📊" },
  { id: 5, title: "Approval", icon: "👍" },
  { id: 6, title: "Publish", icon: "🚀" },
  { id: 7, title: "Knowledge", icon: "💾" },
];

export default function Home() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [publishStatus, setPublishStatus] = useState<"unpublished" | "publishing" | "published" | null>(null);
  const [showLiveContent, setShowLiveContent] = useState(false);
  const [selectedKBItem, setSelectedKBItem] = useState<{ id: string; title: string; description: string } | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAgentDetails, setShowAgentDetails] = useState<string | null>(null);
  const [isWorkflowInitialized, setIsWorkflowInitialized] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const knowledgeBaseDescriptions: Record<string, string> = {
    "1": "Ensures course content aligns with institutional and national standards for quality and rigor.",
    "2": "Defines the competencies and skills students should achieve by completing the course.",
    "3": "Tracks compliance with accreditation requirements and quality assurance standards.",
    "4": "Provides frameworks for defining and measuring professional competencies.",
    "5": "Maps skills to course content and learning outcomes for better alignment.",
    "6": "Centralized database of workforce skills and job-related competencies.",
    "7": "Web Content Accessibility Guidelines ensuring content is accessible to all users.",
    "8": "Patterns and techniques for remediating accessibility issues in course content.",
    "9": "Design principles ensuring products are usable by everyone regardless of ability.",
  };

  const [knowledgeBaseGroups, setKnowledgeBaseGroups] = useState<KnowledgeBaseGroup[]>([
    {
      group: "Standards & Compliance",
      items: [
        { id: "1", title: "Course Standards Alignment" },
        { id: "2", title: "Institutional Learning Outcomes" },
        { id: "3", title: "Accreditation Requirements" },
      ],
    },
    {
      group: "Skills & Competencies",
      items: [
        { id: "4", title: "Competency Frameworks" },
        { id: "5", title: "Skills Mapping Models" },
        { id: "6", title: "Workforce Skills Database" },
      ],
    },
    {
      group: "Accessibility & Design",
      items: [
        { id: "7", title: "WCAG Guidelines" },
        { id: "8", title: "Accessibility Remediation Patterns" },
        { id: "9", title: "Universal Design Principles" },
      ],
    },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleKBItemClick(item: KnowledgeBaseItem) {
    const description = knowledgeBaseDescriptions[item.id] || "No description available";
    setSelectedKBItem({ id: item.id, title: item.title, description });
  }

  function handleNewWorkflow() {
    setPrompt(defaultPrompt);
    setUploadedFiles([]);
    setSelectedAgents([]);
    setResult(null); // Clear results monitor
    setApprovalStatus(null); // Reset approval status
    setPublishStatus(null); // Reset publish status
    setShowLiveContent(false); // Close live content modal
    setIsRunning(false); // Stop any running operations
    setIsSynced(false); // Reset synced status
    setStatus("✓ New workflow created. Ready to begin.");
    setCurrentStep(1);
    setIsWorkflowInitialized(true);
  }

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);

    try {
      console.log(`Uploading file: ${file.name} to ${apiUrl}/files`);
      const response = await fetch(`${apiUrl}/files`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`File upload failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const newFile: UploadedFile = {
        id: data.id || Math.random().toString(36).substr(2, 9),
        name: data.filename || file.name,
        size: data.size || file.size,
      };
      setUploadedFiles((prev) => [...prev, newFile]);
      setStatus(`✓ File "${file.name}" uploaded successfully`);
      setCurrentStep(3); // Advance to "Select Agents" after file upload
      console.log("File uploaded successfully:", newFile);
    } catch (error) {
      let errorMsg = "File upload failed";
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        errorMsg = "Backend API not available. Please ensure the API server is running on port 8000.";
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      setStatus(`❌ Error: ${errorMsg}`);
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
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
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => uploadFile(file));
    }
  }

  function removeFile(fileId: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }

  function toggleAgent(agentKey: string) {
    setSelectedAgents((prev) => {
      const updated = prev.includes(agentKey)
        ? prev.filter((a) => a !== agentKey)
        : [...prev, agentKey];
      // Advance to "Run & Results" once agents are selected
      if (updated.length > 0 && currentStep < 4) {
        setCurrentStep(4);
      }
      return updated;
    });
  }

  async function handleRunWorkflow() {
    if (uploadedFiles.length === 0) {
      setStatus("Error: Please upload at least one file before running the workflow");
      return;
    }

    if (selectedAgents.length === 0) {
      setStatus("Error: Please select at least one agent before running the workflow");
      return;
    }

    setIsRunning(true);
    setStatus("Initializing workflow...");
    setResult(null);

    try {
      console.log("Starting workflow with agents:", selectedAgents);
      console.log("File IDs:", uploadedFiles.map((f) => f.id));

      const payload = {
        use_case: "course-content-blueprint",
        prompt,
        selected_agents: selectedAgents,
        source_file_ids: uploadedFiles.map((f) => f.id),
        parameters: { topic: "course content", files_uploaded: uploadedFiles.length },
      };

      console.log("Workflow payload:", payload);
      setStatus("Sending request to workflow engine...");

      const response = await fetch(`${apiUrl}/workflows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("Workflow response status:", response.status);
      console.log("Workflow response:", responseText);

      if (!response.ok) {
        throw new Error(`Workflow failed with status ${response.status}: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log("Parsed workflow result:", data);

      setStatus(`Workflow completed with status: ${data.status}`);
      setResult(data.result ?? null);
      setIsSynced(true); // Mark as synced when workflow completes
      setCurrentStep(5); // Advance to "Approval" after workflow runs
    } catch (error) {
      let errorMsg = "Workflow request failed";
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        errorMsg = "Backend API not available. Please ensure the API server is running on port 8000.";
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      setStatus(`❌ Error: ${errorMsg}`);
      console.error("Workflow error:", error);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <main className="shell">
      <aside className="progressSidebar" aria-label="Workflow progress">
        <div className="brand">
          <div className="brandMark">A</div>
          <div>
            <strong>Academian</strong>
            <span>Agentic Platform</span>
          </div>
        </div>

        <div className="progressContainer">
          <div className="progressTrack">
            <div className="progressFill" style={{ height: `${(currentStep / workflowSteps.length) * 100}%` }}></div>
          </div>

          <div className="stepsList">
            {workflowSteps.map((step, index) => (
              <div
                key={step.id}
                className={`stepItem ${currentStep >= step.id ? "completed" : ""} ${currentStep === step.id ? "active" : ""}`}
                onClick={() => {
                  const elementId =
                    step.id === 1 ? "workflow" :
                    step.id === 2 ? "files" :
                    step.id === 3 ? "agents" :
                    step.id === 4 ? "results" :
                    step.id === 5 ? "approval" :
                    step.id === 6 ? "publish" :
                    "knowledge";
                  document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth" });
                  setCurrentStep(step.id);
                }}
              >
                <div className="stepNumber">{step.id}</div>
                <div className="stepContent">
                  <div className="stepIcon">{step.icon}</div>
                  <div className="stepTitle">{step.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
              <div className="buttonGroup">
                <button type="button" onClick={handleNewWorkflow} className="secondaryBtn">
                  ➕ New Workflow
                </button>
                <button
                  type="button"
                  onClick={handleRunWorkflow}
                  disabled={isRunning || selectedAgents.length === 0}
                  className="primaryBtn"
                >
                  {isRunning ? "Running..." : "▶ Run Workflow"}
                </button>
              </div>
            </div>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              disabled={!isWorkflowInitialized}
            />
            <div className="flowSteps">
              <span>Blueprint</span>
              <span>Knowledge retrieval</span>
              <span>Agent routing</span>
              <span>Human approval</span>
            </div>
            <div className="workflowStatus">
              {uploadedFiles.length === 0 && <span className="warning">📄 Upload files to proceed</span>}
              {uploadedFiles.length > 0 && <span className="success">✓ {uploadedFiles.length} file(s) uploaded</span>}
              {selectedAgents.length === 0 && <span className="warning">👤 Select agents to proceed</span>}
              {selectedAgents.length > 0 && <span className="success">✓ {selectedAgents.length} agent(s) selected</span>}
            </div>
          </div>

          <div className="panel uploadPanel" id="files">
            <p className="eyebrow">Files & documents</p>
            <div
              className={`uploadTarget ${isDragging ? "dragging" : ""} ${isUploading ? "uploading" : ""} ${!isWorkflowInitialized ? "disabled" : ""}`}
              onDragOver={isWorkflowInitialized ? handleDragOver : undefined}
              onDragLeave={isWorkflowInitialized ? handleDragLeave : undefined}
              onDrop={isWorkflowInitialized ? handleDrop : undefined}
              onClick={() => isWorkflowInitialized && !isUploading && fileInputRef.current?.click()}
              style={{ cursor: !isWorkflowInitialized ? "not-allowed" : isUploading ? "wait" : "pointer" }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                disabled={isUploading || !isWorkflowInitialized}
                style={{ display: "none" }}
                accept=".pdf,.docx,.xlsx,.csv,.json,.txt,.png,.jpg,.jpeg,.gif"
              />
              <FileUp size={28} />
              <strong>{isUploading ? "Uploading..." : "Drop curriculum files"}</strong>
              <span>{isUploading ? "Please wait..." : "PDF, DOCX, CSV, JSON, images, and web URLs"}</span>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="uploadedFilesSection">
                <p className="uploadFilesLabel">📋 Uploaded Files ({uploadedFiles.length})</p>
                <div className="uploadedFilesList">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="uploadedFileItem">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="removeFileBtn"
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="agentGrid" id="agents" aria-label="Domain agents">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isSelected = selectedAgents.includes(agent.key);
            return (
              <article
                className={`agentCard ${agent.tone} ${isSelected ? "selected" : ""} ${!isWorkflowInitialized ? "disabled" : ""}`}
                key={agent.key}
                role="button"
                tabIndex={isWorkflowInitialized ? 0 : -1}
              >
                {isSelected && <CheckCircle2 size={20} className="checkmark" />}
                <Icon size={24} />
                <h3>{agent.name}</h3>
                <p>{agent.description}</p>
                <div className="agentCardActions">
                  <button
                    className="agentSelectBtn"
                    onClick={() => isWorkflowInitialized && toggleAgent(agent.key)}
                    disabled={!isWorkflowInitialized}
                  >
                    {isSelected ? "✓ Selected" : "Select"}
                  </button>
                  <button
                    className="agentInfoBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      isWorkflowInitialized && setShowAgentDetails(showAgentDetails === agent.key ? null : agent.key);
                    }}
                    disabled={!isWorkflowInitialized}
                  >
                    ℹ️
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {showAgentDetails && (
          <div className="modalOverlay" onClick={() => setShowAgentDetails(null)}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <div className="modalHeader">
                <h3>📋 Agent Details</h3>
                <button className="closeBtn" onClick={() => setShowAgentDetails(null)}>✕</button>
              </div>
              <div className="modalBody">
                {agents
                  .filter((agent) => agent.key === showAgentDetails)
                  .map((agent) => (
                    <div key={agent.key} className="agentDetailsPanel">
                      <div className="detailSection">
                        <h4>🎯 Purpose</h4>
                        <p>{agent.description}</p>
                      </div>

                      <div className="detailSection">
                        <h4>📥 Inputs</h4>
                        <ul className="inputsList">
                          {agent.inputs.map((input, idx) => (
                            <li key={idx}>• {input}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="detailSection">
                        <h4>📤 Outputs</h4>
                        <ul className="outputsList">
                          {agent.outputs.map((output, idx) => (
                            <li key={idx}>• {output}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="detailSection">
                        <h4>⚙️ Integration</h4>
                        <p>Connected to the shared knowledge context and orchestrated by LangGraph. Works collaboratively with other agents to provide comprehensive course analysis.</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

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

          {uploadedFiles.length > 0 && (
            <div className="filesSection">
              <p className="eyebrow">Uploaded files for processing</p>
              <div className="uploadedFilesList">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="uploadedFileItem">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="removeFileBtn"
                      title="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedAgents.length > 0 && (
            <div className="agentsSection">
              <p className="eyebrow">Selected agents</p>
              <div className="selectedAgentsList">
                {agents
                  .filter((agent) => selectedAgents.includes(agent.key))
                  .map((agent) => (
                    <span key={agent.key} className="selectedAgentTag">
                      {agent.name}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {status && (
            <div className={`statusText ${isRunning ? "running" : ""}`}>
              {isRunning && <span className="spinner">⏳</span>}
              {status}
            </div>
          )}

          {result && (
            <div className="resultSection">
              <div className="resultHeader">
                <h3>✓ Workflow Execution Complete</h3>
                <span className="resultBadge">{result.agent_results?.length || 0} Agents Executed</span>
              </div>

              <div className="resultSummary">
                <p>{result.summary ?? "Workflow completed successfully"}</p>
              </div>

              {result.agent_results && result.agent_results.length > 0 && (
                <div className="agentTasksContainer">
                  <h4 className="tasksHeader">📋 Agent Tasks Performed</h4>
                  <div className="agentTasksList">
                    {result.agent_results.map((agentResult, index) => {
                      const agentInfo = agents.find(a => a.key === agentResult.agent);
                      return (
                        <div key={agentResult.agent} className="agentTaskCard detailed">
                          <div className="taskCardHeader">
                            <span className="taskNumber">{index + 1}</span>
                            <span className="taskAgent">{agentResult.agent.replace(/-/g, " ").toUpperCase()}</span>
                            <span className={`taskStatus ${agentResult.status}`}>✓ {agentResult.status}</span>
                          </div>

                          <div className="taskCardContent">
                            {/* Agent Purpose/Description */}
                            <div className="taskSection">
                              <h5 className="sectionTitle">🎯 Agent Purpose</h5>
                              <p className="sectionText">{agentInfo?.description || "Specialized agent for processing course content"}</p>
                            </div>

                            {/* Agent Inputs */}
                            <div className="taskSection">
                              <h5 className="sectionTitle">📥 Inputs Provided</h5>
                              <ul className="taskList">
                                {agentInfo?.inputs.map((input, idx) => (
                                  <li key={idx}>• {input}</li>
                                )) || [
                                  <li key="0">• Curriculum files ({uploadedFiles.length} file(s))</li>,
                                  <li key="1">• Custom prompt and parameters</li>,
                                  <li key="2">• Knowledge base context</li>,
                                ]}
                              </ul>
                            </div>

                            {/* Agent Process/Execution */}
                            <div className="taskSection">
                              <h5 className="sectionTitle">⚙️ Process Executed</h5>
                              <ul className="taskList">
                                <li>• Received input data and parameters</li>
                                <li>• Analyzed uploaded curriculum files</li>
                                <li>• Applied specialized processing logic</li>
                                <li>• Generated insights and recommendations</li>
                                <li>• Validated results against quality standards</li>
                              </ul>
                            </div>

                            {/* Agent Outputs */}
                            <div className="taskSection">
                              <h5 className="sectionTitle">📤 Outputs Generated</h5>
                              {agentInfo?.outputs && (
                                <ul className="taskList">
                                  {agentInfo.outputs.map((output, idx) => (
                                    <li key={idx}>• {output}</li>
                                  ))}
                                </ul>
                              )}
                              {agentResult.output && typeof agentResult.output === "object" && (
                                <div className="taskDetails">
                                  <p className="outputsLabel">Generated Data:</p>
                                  {Object.entries(agentResult.output).map(([key, value]) => (
                                    <div key={key} className="taskDetail">
                                      <span className="detailKey">{key.replace(/_/g, " ")}:</span>
                                      <span className="detailValue">{JSON.stringify(value).substring(0, 150)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {result.recommendations && result.recommendations.length > 0 && (
                <div className="recommendationsSection">
                  <h4 className="recommendationsHeader">💡 Next Steps & Recommendations</h4>
                  <div className="recommendationsList">
                    {result.recommendations.map((item, idx) => (
                      <div key={idx} className="recommendationItem">
                        <span className="recNumber">{idx + 1}</span>
                        <span className="recText">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="humanApprovalSection" id="approval">
          <div>
            <p className="eyebrow">Human Approval Checkpoint</p>
            <h2>Review & approve content before publishing</h2>
          </div>

          {result ? (
            <div className="approvalPanel">
              <div className="approvalChecklistItem detailed">
                <div className="itemHeader">
                  <span className="checklistLabel">📋 Content Quality</span>
                  <span className="status pending">Pending Review</span>
                </div>
                <div className="itemDetails">
                  <p className="detailsTitle">Generated Course Blueprint & Learning Materials</p>
                  <p className="detailsText">{result.summary || "Comprehensive course structure with module outlines, learning objectives, and content recommendations generated by AI Content Studio agent."}</p>
                  {result.recommendations && result.recommendations.length > 0 && (
                    <div className="detailsList">
                      <p className="detailsLabel">Key Recommendations:</p>
                      <ul>
                        {result.recommendations.slice(0, 3).map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="approvalChecklistItem detailed">
                <div className="itemHeader">
                  <span className="checklistLabel">♿ Accessibility Compliance</span>
                  <span className="status pending">Pending Review</span>
                </div>
                <div className="itemDetails">
                  <p className="detailsTitle">WCAG 2.1 Accessibility Standards Audit</p>
                  <p className="detailsText">Review of all course materials for accessibility compliance. Includes evaluation of:</p>
                  <ul className="detailsList">
                    <li>Image alt-text and media descriptions</li>
                    <li>Color contrast ratios and readability</li>
                    <li>Keyboard navigation compatibility</li>
                    <li>Screen reader optimization</li>
                  </ul>
                  <p className="actionText">Ensure all content meets WCAG 2.1 Level AA accessibility standards.</p>
                </div>
              </div>

              <div className="approvalChecklistItem detailed">
                <div className="itemHeader">
                  <span className="checklistLabel">📊 Standards Alignment</span>
                  <span className="status pending">Pending Review</span>
                </div>
                <div className="itemDetails">
                  <p className="detailsTitle">Institutional & Accreditation Standards Verification</p>
                  <p className="detailsText">Validation that learning outcomes align with:</p>
                  <ul className="detailsList">
                    <li>Institutional learning outcome frameworks</li>
                    <li>Accreditation body requirements</li>
                    <li>Course standards and quality benchmarks</li>
                    <li>Compliance with regulatory guidelines</li>
                  </ul>
                  <p className="actionText">Confirm all standards are met and accreditation requirements are satisfied.</p>
                </div>
              </div>

              <div className="approvalChecklistItem detailed">
                <div className="itemHeader">
                  <span className="checklistLabel">👥 Workforce Skills Mapping</span>
                  <span className="status pending">Pending Review</span>
                </div>
                <div className="itemDetails">
                  <p className="detailsTitle">Job Market Relevance & Competency Alignment</p>
                  <p className="detailsText">Analysis of course content against current workforce demands. Review includes:</p>
                  <ul className="detailsList">
                    <li>Mapping to in-demand industry skills</li>
                    <li>Career pathway recommendations</li>
                    <li>Competency framework alignment</li>
                    <li>Labor market relevance assessment</li>
                  </ul>
                  <p className="actionText">Verify skills taught match current market needs and future employability.</p>
                </div>
              </div>

              <div className="approvalActions">
                <button
                  className="approveBtn"
                  onClick={() => {
                    setApprovalStatus("approved");
                    setStatus("✓ Content approved and ready for publishing");
                    setCurrentStep(6); // Advance to "Publish" after approval
                  }}
                >
                  ✓ Approve All
                </button>
                <button
                  className="rejectBtn"
                  onClick={() => {
                    setApprovalStatus("rejected");
                    setStatus("✗ Content rejected for revisions");
                  }}
                >
                  ✗ Request Revisions
                </button>
              </div>

              {approvalStatus && (
                <div className={`approvalStatus ${approvalStatus}`}>
                  {approvalStatus === "approved" && (
                    <p>✓ All items approved. Ready for publication.</p>
                  )}
                  {approvalStatus === "rejected" && (
                    <p>✗ Please address feedback and re-submit for approval.</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="emptyState">
              <p>Run a workflow to generate content for review</p>
            </div>
          )}
        </section>

        {approvalStatus === "approved" && (
          <section className="publishSection" id="publish">
            <div>
              <p className="eyebrow">Publishing & Distribution</p>
              <h2>Publish approved content to learning platforms</h2>
            </div>

            {publishStatus ? (
              <div className="publishStatus">
                <div className="publishStatusItem completed">
                  <span className="statusIcon">✓</span>
                  <div>
                    <strong>Content Published</strong>
                    <p>Successfully published to learning platforms</p>
                  </div>
                </div>
                <button
                  className="publishBtn secondary"
                  onClick={() => setShowLiveContent(true)}
                >
                  View Live Content →
                </button>
              </div>
            ) : (
              <div className="publishPanel">
                <div className="publishChecklistItem">
                  <span className="checklistLabel">📤 Export to LMS</span>
                  <span className="publishStatus-badge ready">Ready</span>
                </div>
                <div className="publishChecklistItem">
                  <span className="checklistLabel">📊 Update Analytics Dashboard</span>
                  <span className="publishStatus-badge ready">Ready</span>
                </div>
                <div className="publishChecklistItem">
                  <span className="checklistLabel">🔔 Notify Stakeholders</span>
                  <span className="publishStatus-badge ready">Ready</span>
                </div>
                <div className="publishChecklistItem">
                  <span className="checklistLabel">🌐 Deploy to Production</span>
                  <span className="publishStatus-badge ready">Ready</span>
                </div>

                <div className="publishActions">
                  <button
                    className="publishBtn"
                    onClick={() => {
                      setPublishStatus("published");
                      setStatus("✓ Content successfully published and deployed");
                      setCurrentStep(7); // Advance to "Knowledge" after publishing
                    }}
                  >
                    🚀 Publish Now
                  </button>
                  <button className="publishBtn secondary">
                    ⏱️ Schedule Publication
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        <section className="knowledgeBaseSection" id="knowledge">
          <div>
            <p className="eyebrow">Knowledge Base Integration</p>
            <h2>Shared context for agents and learning materials</h2>
          </div>

          <div className="knowledgeBaseGroupsContainer">
            {knowledgeBaseGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="knowledgeBaseGroup">
                <h3 className="groupTitle">📁 {group.group}</h3>
                <div className="groupItems">
                  {group.items.map((item) => (
                    <div key={item.id} className="knowledgeBaseItem" onClick={() => handleKBItemClick(item)}>
                      <div className="itemContent">
                        <span className="itemIcon">📚</span>
                        <div>
                          <p className="itemTitle">{item.title}</p>
                          <p className="itemMeta">Connected • {isSynced ? "✓ Synced" : "Not synced"}</p>
                        </div>
                      </div>
                      <button className="itemAction" onClick={(e) => {
                        e.stopPropagation();
                        handleKBItemClick(item);
                      }}>→</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="knowledgeBaseStats">
            <div className="statItem">
              <span className="statValue">{knowledgeBaseGroups.reduce((sum, g) => sum + g.items.length, 0)}</span>
              <span className="statLabel">Total Items</span>
            </div>
            <div className="statItem">
              <span className="statValue">{knowledgeBaseGroups.length}</span>
              <span className="statLabel">Categories</span>
            </div>
            <div className="statItem">
              <span className="statValue">5</span>
              <span className="statLabel">Agents Connected</span>
            </div>
            <div className="statItem">
              <span className="statValue">{isSynced ? "✓ Synced" : "Not synced"}</span>
              <span className="statLabel">Status</span>
            </div>
          </div>
        </section>

        {selectedKBItem && (
          <div className="modalOverlay" onClick={() => setSelectedKBItem(null)}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <div className="modalHeader">
                <h3>📚 {selectedKBItem.title}</h3>
                <button className="closeBtn" onClick={() => setSelectedKBItem(null)}>✕</button>
              </div>
              <div className="modalBody">
                <p className="modalDescription">{selectedKBItem.description}</p>
                <div className="itemDetails">
                  <div className="detailItem">
                    <span className="detailLabel">Status:</span>
                    <span className="detailValue">Active & Synced</span>
                  </div>
                  <div className="detailItem">
                    <span className="detailLabel">Connected Agents:</span>
                    <span className="detailValue">3 of 5 agents</span>
                  </div>
                  <div className="detailItem">
                    <span className="detailLabel">Last Updated:</span>
                    <span className="detailValue">Today</span>
                  </div>
                </div>
                <button className="learnMoreBtn">Learn More →</button>
              </div>
            </div>
          </div>
        )}

        {showLiveContent && (
          <div className="modalOverlay" onClick={() => setShowLiveContent(false)}>
            <div className="liveContentModal" onClick={(e) => e.stopPropagation()}>
              <div className="liveContentHeader">
                <h3>🌐 Live Published Content</h3>
                <button className="closeBtn" onClick={() => setShowLiveContent(false)}>✕</button>
              </div>
              <div className="liveContentBody">
                <div className="contentPreview">
                  <div className="previewSection">
                    <h4>📋 Course Blueprint</h4>
                    <p>{result?.summary || "Create a standards-aligned learning module from the uploaded curriculum source. Include accessibility checks and workforce skill mapping."}</p>
                  </div>

                  <div className="previewSection">
                    <h4>✓ Agent Outputs</h4>
                    {result?.agent_results?.map((agentResult) => (
                      <div key={agentResult.agent} className="agentOutput">
                        <strong>{agentResult.agent}</strong>
                        <p className="outputText">{Object.entries(agentResult.output).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(', ')}</p>
                      </div>
                    ))}
                  </div>

                  <div className="previewSection">
                    <h4>💡 Recommendations</h4>
                    <ul>
                      {result?.recommendations?.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="contentLinks">
                  <button
                    className="linkBtn"
                    onClick={() => {
                      setStatus("✓ Opening Learning Portal...");
                      window.open("http://localhost:3000/learning", "_blank");
                    }}
                  >
                    📖 Open Learning Portal →
                  </button>
                  <button
                    className="linkBtn"
                    onClick={() => {
                      setStatus("✓ Opening Analytics Dashboard...");
                      window.open("http://localhost:3000/analytics", "_blank");
                    }}
                  >
                    📊 View Analytics →
                  </button>
                  <button
                    className="linkBtn"
                    onClick={() => {
                      setStatus("✓ Generating investor report...");
                      alert("📧 Investor report will be sent to configured email addresses");
                    }}
                  >
                    🚀 Share with Investors →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
