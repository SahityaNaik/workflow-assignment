import React, { useState, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";

const nodeTypesList = [
  { type: "start", label: "Start" },
  { type: "process", label: "Process" },
  { type: "decision", label: "Decision" },
  { type: "end", label: "End" },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  // Handle drag start
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
    setDraggingNode(nodeType);
  };

  // Handle drop position
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (!type) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 75,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: `${type}-${+new Date()}`,
        type: "default",
        position,
        data: { label: type },
        style: { backgroundColor: "#E0F2FE", padding: 10, borderRadius: 8 },
      };

      setNodes((nds) => nds.concat(newNode));
      setDraggingNode(null);
    },
    [setNodes]
  );

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  // Select node for editing
  const onNodeClick = (_, node) => {
    setSelectedNode(node);
  };

  // Handle node edits
  const handleNodeChange = (field, value) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? {
              ...n,
              data: {
                ...n.data,
                [field]: value,
                label: n.data.name || n.data.label,
              },
              style:
                field === "color"
                  ? { ...n.style, backgroundColor: value }
                  : n.style,
            }
          : n
      )
    );
    setSelectedNode((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
    }));
  };

  // Export workflow
  const handleExport = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.json";
    a.click();
  };

  // Import workflow
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    };
    reader.readAsText(file);
  };

  // Generate workflow (AI)
  const handleGenerate = async () => {
    const description = prompt("Enter workflow description:");
    if (!description) return;

    try {
      const res = await axios.post("http://127.0.0.1:8000/generate_workflow", {
        description,
      });

      let workflow = res.data.workflow;

      // If the AI returned a string (JSON text), parse it
      if (typeof workflow === "string") {
        try {
          workflow = JSON.parse(workflow);
        } catch (e) {
          console.error("Failed to parse workflow JSON:", e);
          alert("AI returned invalid workflow JSON.");
          return;
        }
      }

      const newNodes = (workflow.nodes || []).map((n, i) => ({
        ...n,
        id: n.id || `n${i}`,
        type: "default",
        position: n.position || { x: 100 + i * 150, y: 100 + i * 100 },
        data: { label: n.data?.label || n.id || `Node ${i}` },
        style: {
          backgroundColor: n.style?.backgroundColor || "#E0F2FE",
          padding: 10,
          borderRadius: 8,
        },
      }));

      const newEdges = (workflow.edges || []).map((e, i) => ({
        ...e,
        id: e.id || `e${i}`,
      }));

      setNodes(newNodes);
      setEdges(newEdges);
      alert("✅ Workflow generated successfully!");
    } catch (err) {
      console.error("AI Workflow generation failed:", err);
      alert("❌ Error generating workflow. Ensure backend is running.");
    }
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Left Panel */}
      <div className="w-1/5 bg-gray-100 border-r p-4">
        <h2 className="font-bold mb-4">Node Types</h2>
        {nodeTypesList.map((n) => (
          <div
            key={n.type}
            draggable
            onDragStart={(e) => onDragStart(e, n.type)}
            className="p-2 mb-2 bg-blue-100 rounded-md text-center cursor-move hover:bg-blue-200"
          >
            {n.label}
          </div>
        ))}
        <div className="mt-4 space-x-2">
          <button
            onClick={handleExport}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Export
          </button>
          <label className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer">
            Import
            <input type="file" hidden onChange={handleImport} />
          </label>
          <button
            onClick={handleGenerate}
            className="bg-purple-500 text-white px-3 py-1 rounded mt-2"
          >
            Generate AI Workflow
          </button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {/* Right Panel */}
      <div className="w-1/5 bg-gray-100 border-l p-4">
        <h2 className="font-bold mb-2">Edit Node</h2>
        {selectedNode ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Name"
              value={selectedNode.data.name || ""}
              onChange={(e) => handleNodeChange("name", e.target.value)}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Description"
              value={selectedNode.data.description || ""}
              onChange={(e) => handleNodeChange("description", e.target.value)}
              className="w-full p-2 border rounded"
            />
            <select
              value={selectedNode.data.category || ""}
              onChange={(e) => handleNodeChange("category", e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Category</option>
              <option value="general">General</option>
              <option value="decision">Decision</option>
              <option value="end">End</option>
            </select>
            <input
              type="color"
              value={selectedNode.style?.backgroundColor || "#E0F2FE"}
              onChange={(e) => handleNodeChange("color", e.target.value)}
              className="w-full"
            />
          </div>
        ) : (
          <p>Select a node to edit</p>
        )}
      </div>
    </div>
  );
}
