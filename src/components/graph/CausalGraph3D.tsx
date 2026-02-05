"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import type { BaseNode, Edge, NodeType } from "@/types";
import { getNodeColor } from "@/lib/data";

// ============================================================
// Types
// ============================================================

interface GraphNode3D {
  id: string;
  name: string;
  type: NodeType;
  position: [number, number, number];
  color: string;
  size: number;
}

interface GraphEdge3D {
  source: string;
  target: string;
  direction?: string;
  strength?: string;
}

interface CausalGraph3DProps {
  nodes: BaseNode[];
  edges: Edge[];
  onNodeClick?: (nodeId: string) => void;
  focusNodeId?: string;
  highlightedNodes?: Set<string>;
  scenarioResults?: Map<string, "up" | "down" | "complex">;
}

// ============================================================
// Layout Algorithm — Force-directed (simplified)
// ============================================================

function computeLayout(
  nodes: BaseNode[],
  edges: Edge[]
): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();
  const radius = Math.max(8, nodes.length * 0.4);

  // Group by type for clustering
  const groups: Record<string, BaseNode[]> = {};
  nodes.forEach((n) => {
    if (!groups[n.type]) groups[n.type] = [];
    groups[n.type].push(n);
  });

  const typeOffsets: Record<string, [number, number]> = {
    macro: [0, 0],
    sector: [radius * 0.6, radius * 0.3],
    theme: [-radius * 0.6, radius * 0.3],
    company: [0, -radius * 0.6],
    report: [radius * 0.4, -radius * 0.4],
  };

  Object.entries(groups).forEach(([type, groupNodes]) => {
    const [ox, oz] = typeOffsets[type] || [0, 0];
    const count = groupNodes.length;
    groupNodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / count;
      const r = Math.min(radius * 0.5, count * 0.6);
      const x = ox + Math.cos(angle) * r;
      const z = oz + Math.sin(angle) * r;
      const y = (Math.random() - 0.5) * 3;
      positions.set(node.id, [x, y, z]);
    });
  });

  // Simple force-directed relaxation (edge attraction)
  for (let iter = 0; iter < 30; iter++) {
    edges.forEach((edge) => {
      const sp = positions.get(edge.source);
      const tp = positions.get(edge.target);
      if (!sp || !tp) return;

      const dx = tp[0] - sp[0];
      const dy = tp[1] - sp[1];
      const dz = tp[2] - sp[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const idealDist = 4;

      if (dist > idealDist) {
        const force = (dist - idealDist) * 0.02;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        const fz = (dz / dist) * force;
        sp[0] += fx;
        sp[1] += fy;
        sp[2] += fz;
        tp[0] -= fx;
        tp[1] -= fy;
        tp[2] -= fz;
      }
    });
  }

  return positions;
}

// ============================================================
// 3D Node Component
// ============================================================

function GraphNodeMesh({
  node,
  isHighlighted,
  isFocused,
  scenarioDirection,
  onClick,
}: {
  node: GraphNode3D;
  isHighlighted: boolean;
  isFocused: boolean;
  scenarioDirection?: "up" | "down" | "complex";
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = useMemo(() => {
    if (scenarioDirection === "up") return "#10B981";
    if (scenarioDirection === "down") return "#EF4444";
    if (scenarioDirection === "complex") return "#F59E0B";
    return node.color;
  }, [node.color, scenarioDirection]);

  const scale = useMemo(() => {
    if (isFocused) return 1.8;
    if (isHighlighted) return 1.4;
    if (hovered) return 1.3;
    return 1;
  }, [isFocused, isHighlighted, hovered]);

  const opacity = useMemo(() => {
    if (isFocused || isHighlighted) return 1;
    return 0.6;
  }, [isFocused, isHighlighted]);

  useFrame((state) => {
    if (!meshRef.current) return;
    if (isFocused) {
      meshRef.current.position.y =
        node.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={scale * node.size}
      >
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isFocused ? 0.8 : hovered ? 0.5 : 0.2}
          transparent
          opacity={opacity}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      {(hovered || isFocused || isHighlighted) && (
        <Text
          position={[0, node.size * 0.4 + 0.3, 0]}
          fontSize={0.25}
          color="#E5E7EB"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="#0A0A0F"
        >
          {node.name}
        </Text>
      )}
      {/* Glow ring */}
      {(isFocused || isHighlighted) && (
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={scale * node.size}>
          <ringGeometry args={[0.35, 0.42, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// ============================================================
// 3D Edge Component
// ============================================================

function GraphEdgeLine({
  sourcePos,
  targetPos,
  direction,
  strength,
  isHighlighted,
}: {
  sourcePos: [number, number, number];
  targetPos: [number, number, number];
  direction?: string;
  strength?: string;
  isHighlighted: boolean;
}) {
  const color =
    direction === "positive"
      ? "#10B981"
      : direction === "negative"
      ? "#EF4444"
      : "#F59E0B";

  const lineWidth = strength === "strong" ? 2 : strength === "medium" ? 1.5 : 1;
  const opacity = isHighlighted ? 0.8 : 0.15;

  return (
    <Line
      points={[sourcePos, targetPos]}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
    />
  );
}

// ============================================================
// Scene Component
// ============================================================

function Scene({
  graphNodes,
  graphEdges,
  positions,
  onNodeClick,
  focusNodeId,
  highlightedNodes,
  scenarioResults,
}: {
  graphNodes: GraphNode3D[];
  graphEdges: GraphEdge3D[];
  positions: Map<string, [number, number, number]>;
  onNodeClick?: (nodeId: string) => void;
  focusNodeId?: string;
  highlightedNodes?: Set<string>;
  scenarioResults?: Map<string, "up" | "down" | "complex">;
}) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color="#06B6D4" />

      {/* Edges */}
      {graphEdges.map((edge, i) => {
        const sp = positions.get(edge.source);
        const tp = positions.get(edge.target);
        if (!sp || !tp) return null;

        const isHighlighted =
          focusNodeId === edge.source ||
          focusNodeId === edge.target ||
          highlightedNodes?.has(edge.source) ||
          highlightedNodes?.has(edge.target) ||
          false;

        return (
          <GraphEdgeLine
            key={`edge-${i}`}
            sourcePos={sp}
            targetPos={tp}
            direction={edge.direction}
            strength={edge.strength}
            isHighlighted={isHighlighted}
          />
        );
      })}

      {/* Nodes */}
      {graphNodes.map((node) => (
        <GraphNodeMesh
          key={node.id}
          node={node}
          isFocused={focusNodeId === node.id}
          isHighlighted={highlightedNodes?.has(node.id) || false}
          scenarioDirection={scenarioResults?.get(node.id)}
          onClick={() => onNodeClick?.(node.id)}
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        minDistance={5}
        maxDistance={50}
      />
    </>
  );
}

// ============================================================
// Main Component
// ============================================================

export function CausalGraph3D({
  nodes,
  edges,
  onNodeClick,
  focusNodeId,
  highlightedNodes,
  scenarioResults,
}: CausalGraph3DProps) {
  const positions = useMemo(() => computeLayout(nodes, edges), [nodes, edges]);

  const graphNodes: GraphNode3D[] = useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        name: n.name,
        type: n.type,
        position: positions.get(n.id) || [0, 0, 0],
        color: getNodeColor(n.type),
        size: n.type === "macro" ? 1.2 : n.type === "company" ? 0.8 : 1,
      })),
    [nodes, positions]
  );

  const graphEdges: GraphEdge3D[] = useMemo(
    () =>
      edges.map((e) => ({
        source: e.source,
        target: e.target,
        direction: e.direction,
        strength: e.strength,
      })),
    [edges]
  );

  return (
    <div className="w-full h-full bg-atlas-bg rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 8, 18], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "#0A0A0F" }}
      >
        <Scene
          graphNodes={graphNodes}
          graphEdges={graphEdges}
          positions={positions}
          onNodeClick={onNodeClick}
          focusNodeId={focusNodeId}
          highlightedNodes={highlightedNodes}
          scenarioResults={scenarioResults}
        />
      </Canvas>
    </div>
  );
}
