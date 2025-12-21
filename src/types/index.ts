// Person interface matching Rails API response
export interface Person {
  name: string;
}

// Search parameters
export interface SearchParams {
  from: string;
  to: string;
}

// Log message types
export interface LogMessage {
  id: string;
  timestamp: Date;
  content: string;
  type: 'info' | 'success' | 'error';
}

// ActionCable WebSocket message types (matching Rails PathfindingChannel)
export interface WebSocketMessage {
  type: 'node_explored' | 'level_explored' | 'path_found' | 'error' | 'timeout' | 'link_info';
  data: NodeExploredData | LevelExploredData | PathFoundData | LinkInfoData | string;
}

export interface NodeExploredData {
  level: number;
  node: string;
  nodesExploredAtLevel?: number;
}

export interface LevelExploredData {
  level: number;
  nodes: string[];
}

export interface PathFoundData {
  path: string[];
  length: number;
}

export interface LinkInfoData {
  step: number;
  from: string;
  to: string;
  excerpt: string;
  found: boolean;
  source_url?: string;
}

// ActionCable subscription message format
export interface ActionCableMessage {
  identifier: string;
  command: string;
  data?: {
    action: string;
    start_node?: string;
    end_node?: string;
  };
}

// Adjacency map from /api/graph
export type AdjacencyMap = Record<string, string[]>;

