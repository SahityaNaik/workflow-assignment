import React, { useState, useCallback, useEffect } from "react";
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

  // Validation Rules + Edge Connect Handler
  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      // Rule 1: Start node cannot have incoming edges
      if (targetNode?.type === "start") {
        alert("Start node cannot have incoming edges!");
        return;
      }

      // Rule 2: Decision node can only have 2 outgoing edges
      const outgoing = edges.filter((e) => e.source === sourceNode?.id);
      if (sourceNode?.type === "decision" && outgoing.length >= 2) {
        alert("Decision node can only have 2 outgoing edges!");
        return;
      }

      setEdges((eds) => addEdge(params, eds));
    },
    [nodes, edges]
  );

  // Persist nodes & edges in localStorage
  useEffect(() => {
    const savedNodes = JSON.parse(localStorage.getItem("workflow-nodes") || "[]");
    const savedEdges = JSON.parse(localStorage.getItem("workflow-edges") || "[]");
    if (savedNodes.length > 0) setNodes(savedNodes);
    if (savedEdges.length > 0) setEdges(savedEdges);
  }, []);

  useEffect(() => {
    localStorage.setItem("workflow-nodes", JSON.stringify(nodes));
    localStorage.setItem("workflow-edges", JSON.stringify(edges));
  }, [nodes, edges]);

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
      const res = await axios.post(
        "https://workflow-assignment.onrender.com/generate_workflow",
        { description }
      );

      let workflow = res.data.workflow;

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
      alert("Workflow generated successfully!");
    } catch (err) {
      console.error("AI Workflow generation failed:", err);
      alert("Error generating workflow. Ensure backend is running.");
    }
  };

  // Clear Canvas Handler
  const handleClearCanvas = () => {
    if (window.confirm("Clear all nodes and edges?")) {
      setNodes([]);
      setEdges([]);
      localStorage.removeItem("workflow-nodes");
      localStorage.removeItem("workflow-edges");
    }
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Left Panel */}
      <div className="w-1/5 bg-gray-100 border-r p-4 flex flex-col">
        <h2 className="font-bold mb-4">Node Types</h2>
        <div className="space-y-2 mb-6">
          {nodeTypesList.map((n) => (
            <div
              key={n.type}
              draggable
              onDragStart={(e) => onDragStart(e, n.type)}
              className="p-2 bg-blue-100 rounded-md text-center cursor-move hover:bg-blue-200"
            >
              {n.label}
            </div>
          ))}
        </div>

        {/* Buttons Section */}
        <div className="mt-4">
          <div className="flex justify-between space-x-2 mb-3">
            <button
              onClick={handleExport}
              className="flex-1 bg-green-500 text-white px-2 py-2 rounded hover:bg-green-600"
            >
              Export
            </button>

            <label className="flex-1 bg-blue-500 text-white px-2 py-2 rounded text-center cursor-pointer hover:bg-blue-600">
              Import
              <input type="file" hidden onChange={handleImport} />
            </label>

            <button
              onClick={handleClearCanvas}
              className="flex-1 bg-red-500 text-white px-2 py-2 rounded hover:bg-red-600"
            >
              Clear
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGenerate}
              className="bg-purple-500 text-white px-3 py-2 rounded w-4/5 hover:bg-purple-600"
            >
              Generate AI Workflow
            </button>
          </div>
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
