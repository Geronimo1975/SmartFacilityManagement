import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

type OccupancyData = {
  buildingId: number;
  zone: string;
  count: number;
};

type OccupancyMessage = {
  type: 'occupancy_update';
} & OccupancyData;

export function useOccupancy(buildingId: number) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as OccupancyMessage;
        if (message.type === 'occupancy_update' && message.buildingId === buildingId) {
          queryClient.invalidateQueries({
            queryKey: ['/api/buildings', buildingId, 'occupancy']
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setWs(null);

      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect...');
      }, 3000);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [buildingId, queryClient]);

  const updateOccupancy = useCallback((zone: string, count: number) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'occupancy_update',
        buildingId,
        zone,
        count,
      }));
    }
  }, [ws, buildingId]);

  return { updateOccupancy, isConnected };
}