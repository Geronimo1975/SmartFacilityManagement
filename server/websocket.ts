import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';
import { db } from '@db';
import { occupancyData } from '@db/schema';

interface OccupancyMessage {
  type: 'occupancy_update';
  buildingId: number;
  zone: string;
  count: number;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    verifyClient: (info) => {
      // Ignore Vite HMR connections
      const protocol = info.req.headers['sec-websocket-protocol'];
      return protocol !== 'vite-hmr';
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to occupancy WebSocket');

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message) as OccupancyMessage;

        if (data.type === 'occupancy_update') {
          // Store the occupancy data
          await db.insert(occupancyData).values({
            buildingId: data.buildingId,
            zone: data.zone,
            occupancyCount: data.count,
          });

          // Broadcast to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from occupancy WebSocket');
    });
  });

  return wss;
}