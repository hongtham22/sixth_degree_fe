import { useState, useRef, useCallback } from 'react';
import type { LogMessage, SearchParams, WebSocketMessage, NodeExploredData, PathFoundData, LevelExploredData, LinkInfoData } from '../types';

// Import ActionCable
import { createConsumer } from '@rails/actioncable';

export const useWebSocket = () => {
  const [messages, setMessages] = useState<LogMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [exploredNodes, setExploredNodes] = useState<string[]>([]);
  const [activePath, setActivePath] = useState<string[]>([]);
  const [linkInfo, setLinkInfo] = useState<LinkInfoData[]>([]);
  const subscriptionRef = useRef<import('@rails/actioncable').Subscription | null>(null);
  const cableRef = useRef<import('@rails/actioncable').Consumer | null>(null);

  const addLogMessage = useCallback((content: string, type: LogMessage['type'] = 'info') => {
    const newMessage: LogMessage = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      timestamp: new Date(),
      content,
      type
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    switch (data.type) {
      case 'node_explored': {
        const nodeData = data.data as NodeExploredData;
        if (nodeData.node) {
          const count = nodeData.nodesExploredAtLevel;
          const suffix = typeof count === 'number' ? ` (nodes explored at level: ${count})` : '';
          addLogMessage(`Level ${nodeData.level}: Path node ${nodeData.node}${suffix}`, 'info');
          setExploredNodes(prev => [...prev, nodeData.node]);
        }
        break;
      }
      case 'level_explored': {
        const levelData = data.data as LevelExploredData;
        if (Array.isArray(levelData.nodes) && levelData.nodes.length > 0) {
          addLogMessage(`Level ${levelData.level}: explored ${levelData.nodes.length} nodes`, 'info');
          setExploredNodes(prev => [...prev, ...levelData.nodes]);
        }
        break;
      }
      case 'path_found': {
        const pathData = data.data as PathFoundData;
        if (pathData.path && Array.isArray(pathData.path)) {
          addLogMessage(`Path found: ${pathData.path.join(' → ')} (${pathData.length} steps)`, 'success');
          setActivePath(pathData.path);
        }
        setIsSearching(false);
        break;
      }
      case 'error': {
        const errorMessage = data.data as string;
        addLogMessage(`Error: ${errorMessage}`, 'error');
        setIsSearching(false);
        break;
      }
      case 'timeout': {
        const timeoutMessage = data.data as string;
        addLogMessage(`Timeout: ${timeoutMessage}`, 'error');
        setIsSearching(false);
        break;
      }
      case 'link_info': {
        const linkData = data.data as LinkInfoData;
        addLogMessage(`Step ${linkData.step}: ${linkData.from} → ${linkData.to}`, 'info');
        addLogMessage(`  ${linkData.excerpt}`, 'info');
        setLinkInfo(prev => {
          // Update or add link info for this step
          const updated = [...prev];
          const existingIndex = updated.findIndex(li => li.step === linkData.step);
          if (existingIndex >= 0) {
            updated[existingIndex] = linkData;
          } else {
            updated.push(linkData);
          }
          return updated.sort((a, b) => a.step - b.step);
        });
        break;
      }
      default: {
        const unknownType = (data as { type?: string }).type || 'unknown';
        addLogMessage(`Unknown message type: ${unknownType}`, 'error');
        break;
      }
    }
  }, [addLogMessage]);

  const connectAndSearch = useCallback((searchParams: SearchParams) => {
    // Close existing connection if any
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (cableRef.current) {
      cableRef.current.disconnect();
      cableRef.current = null;
    }

    // Reset state
    setExploredNodes([]);
    setActivePath([]);
    setLinkInfo([]);
    setMessages([]);
    setIsSearching(true);

    try {
      // Build WebSocket URL based on current origin
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const protocol = isHttps ? 'wss' : 'ws';
      const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
      const isViteDev = typeof window !== 'undefined' && window.location.port === '5173';
      const cableUrl = isViteDev ? 'ws://localhost:3000/cable' : `${protocol}://${host}/cable`;
      
      // Create ActionCable consumer
      console.log('Creating ActionCable connection to:', cableUrl);
      const cable = createConsumer(cableUrl);
      cableRef.current = cable;
      
      console.log('ActionCable consumer created:', cable);

      // Subscribe to PathfindingChannel
      const subscription = cable.subscriptions.create(
        { channel: 'PathfindingChannel' },
        {
          connected: () => {
            console.log('ActionCable connected');
            setIsConnected(true);
            addLogMessage('Connected to pathfinding server', 'success');
            
            // Send search request (Rails expects camelCase: startNode, endNode)
            subscription.perform('search', {
              startNode: searchParams.from,
              endNode: searchParams.to
            });
            addLogMessage(`Searching path from ${searchParams.from} to ${searchParams.to}...`, 'info');
          },
          disconnected: () => {
            console.log('ActionCable disconnected');
            setIsConnected(false);
            addLogMessage('Connection closed', 'info');
            setIsSearching(false);
          },
          rejected: () => {
            console.error('ActionCable subscription rejected');
            setIsConnected(false);
            addLogMessage('Connection rejected by server', 'error');
            setIsSearching(false);
          },
          received: (data: WebSocketMessage) => {
            console.log('ActionCable received:', data);
            handleWebSocketMessage(data);
          }
        }
      );

      // Note: ActionCable handles errors through the subscription callbacks
      // No need to add separate event listener

      subscriptionRef.current = subscription;

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      addLogMessage('Failed to connect to server', 'error');
      setIsSearching(false);
      setIsConnected(false);
    }
  }, [addLogMessage, handleWebSocketMessage]);

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (cableRef.current) {
      cableRef.current.disconnect();
      cableRef.current = null;
    }
    setIsConnected(false);
    setIsSearching(false);
    setExploredNodes([]);
    setActivePath([]);
  }, []);

  return {
    messages,
    isConnected,
    isSearching,
    exploredNodes,
    activePath,
    linkInfo,
    connectAndSearch,
    disconnect
  };
};

