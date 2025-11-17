'use client'

import React, { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Brain, Lightbulb, ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KnowledgeGraphResponse } from '@/lib/api'

interface KnowledgeTreeProps {
  data: KnowledgeGraphResponse
  onNodeClick?: (nodeId: string, nodeData: any) => void
  className?: string
}

// Custom Node Components
const RootNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={cn(
    "px-6 py-4 shadow-lg rounded-lg border-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white min-w-[200px]",
    selected && "ring-2 ring-blue-300"
  )}>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    <div className="flex items-center space-x-2">
      <Brain className="h-5 w-5" />
      <div>
        <div className="font-bold text-lg">{data.label}</div>
        <div className="text-sm opacity-90">{data.description}</div>
      </div>
    </div>
  </div>
)

const BranchNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={cn(
    "px-4 py-3 shadow-md rounded-lg border bg-white min-w-[160px]",
    selected && "ring-2 ring-blue-300"
  )}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    <div className="flex items-center space-x-2">
      <BookOpen className="h-4 w-4 text-blue-600" />
      <div>
        <div className="font-semibold text-gray-900">{data.label}</div>
        <div className="text-xs text-gray-600">{data.description}</div>
      </div>
    </div>
  </div>
)

const LeafNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={cn(
    "px-3 py-2 shadow-sm rounded-md border bg-green-50 min-w-[120px]",
    selected && "ring-2 ring-green-300"
  )}>
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="flex items-center space-x-2">
      <Lightbulb className="h-3 w-3 text-green-600" />
      <div>
        <div className="font-medium text-sm text-gray-900">{data.label}</div>
        <div className="text-xs text-gray-600">{data.description}</div>
      </div>
    </div>
  </div>
)

const nodeTypes: NodeTypes = {
  root: RootNode,
  branch: BranchNode,
  leaf: LeafNode,
}

export function KnowledgeTree({ data, onNodeClick, className }: KnowledgeTreeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges || [])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClickHandler = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    onNodeClick?.(node.id, node.data)
  }, [onNodeClick])

  const fitView = useCallback(() => {
    // This would typically be handled by the ReactFlow instance
    console.log('Fit view')
  }, [])

  const nodeStats = useMemo(() => {
    const stats = {
      total: nodes.length,
      root: 0,
      branch: 0,
      leaf: 0
    }
    
    nodes.forEach(node => {
      if (node.type === 'root') stats.root++
      else if (node.type === 'branch') stats.branch++
      else if (node.type === 'leaf') stats.leaf++
    })
    
    return stats
  }, [nodes])

  if (!data.nodes || data.nodes.length === 0) {
    return (
      <Card className={cn("w-full h-96 flex items-center justify-center", className)}>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No knowledge tree data available</p>
            <p className="text-sm">Upload a document to generate the knowledge tree</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("w-full h-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Tree</h2>
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant="outline">
              {nodeStats.total} Total Nodes
            </Badge>
            <Badge variant="secondary">
              {nodeStats.root} Root
            </Badge>
            <Badge variant="secondary">
              {nodeStats.branch} Branches
            </Badge>
            <Badge variant="secondary">
              {nodeStats.leaf} Concepts
            </Badge>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={fitView}>
            <Maximize className="h-4 w-4 mr-2" />
            Fit View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClickHandler}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
                className="bg-gray-50"
              >
                <Controls />
                <MiniMap 
                  nodeColor={(node) => {
                    switch (node.type) {
                      case 'root': return '#3b82f6'
                      case 'branch': return '#10b981'
                      case 'leaf': return '#f59e0b'
                      default: return '#6b7280'
                    }
                  }}
                  className="!bg-white !border-2"
                />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              </ReactFlow>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Node Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-3">
                  <div>
                    <Badge variant={
                      selectedNode.type === 'root' ? 'default' :
                      selectedNode.type === 'branch' ? 'secondary' : 'outline'
                    }>
                      {selectedNode.type}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedNode.data.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedNode.data.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Level: {selectedNode.data.level || 0}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click on a node to see details
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <span className="text-sm">Root Topics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-white border"></div>
                <span className="text-sm">Subtopics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-green-50 border border-green-200"></div>
                <span className="text-sm">Concepts</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}