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
  const queryClient = useQueryClient();

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as OccupancyMessage;
        if (message.type === 'occupancy_update' && message.buildingId === buildingId) {
          queryClient.invalidateQueries(['/api/buildings', buildingId, 'occupancy']);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setWs(null);
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

  return { updateOccupancy };
}
