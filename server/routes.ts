// Reference: javascript_websocket blueprint integration
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertCoordinateSchema, updateActiveConfigSchema, type WSMessage } from "@shared/schema";
import { z } from "zod";

const clients = new Set<WebSocket>();

function broadcastToAll(message: WSMessage) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    clients.add(ws);

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });

    ws.on('message', async (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        
        if (message.type === 'location_update') {
          console.log('Location update received:', message.data);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
  });

  app.get('/api/coordinates', async (req, res) => {
    try {
      const coords = await storage.getCoordinates();
      res.json(coords);
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      res.status(500).json({ error: 'Failed to fetch coordinates' });
    }
  });

  app.post('/api/coordinates', async (req, res) => {
    try {
      const validated = insertCoordinateSchema.parse(req.body);
      const coordinate = await storage.createCoordinate(validated);
      
      const allCoordinates = await storage.getCoordinates();
      broadcastToAll({
        type: 'coordinates_update',
        data: allCoordinates,
      });

      res.json(coordinate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error('Error creating coordinate:', error);
        res.status(500).json({ error: 'Failed to create coordinate' });
      }
    }
  });

  app.delete('/api/coordinates/:id', async (req, res) => {
    try {
      await storage.deleteCoordinate(req.params.id);
      
      const allCoordinates = await storage.getCoordinates();
      broadcastToAll({
        type: 'coordinates_update',
        data: allCoordinates,
      });

      const config = await storage.getActiveConfig();
      if (config && config.activeCoordinateIds.includes(req.params.id)) {
        const updatedIds = config.activeCoordinateIds.filter(id => id !== req.params.id);
        await storage.updateActiveConfig({ activeCoordinateIds: updatedIds });
        
        const updatedConfig = await storage.getActiveConfig();
        if (updatedConfig) {
          broadcastToAll({
            type: 'config_update',
            data: updatedConfig,
          });
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting coordinate:', error);
      res.status(500).json({ error: 'Failed to delete coordinate' });
    }
  });

  app.get('/api/config', async (req, res) => {
    try {
      let config = await storage.getActiveConfig();
      
      if (!config) {
        config = await storage.createActiveConfig(3, 500, 30, []);
      }

      res.json(config);
    } catch (error) {
      console.error('Error fetching config:', error);
      res.status(500).json({ error: 'Failed to fetch config' });
    }
  });

  app.patch('/api/config', async (req, res) => {
    try {
      const validated = updateActiveConfigSchema.parse(req.body);
      const config = await storage.updateActiveConfig(validated);
      
      if (config) {
        broadcastToAll({
          type: 'config_update',
          data: config,
        });
      }

      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error('Error updating config:', error);
        res.status(500).json({ error: 'Failed to update config' });
      }
    }
  });

  app.post('/api/config/generate', async (req, res) => {
    try {
      const { k } = req.body;
      
      if (!k || typeof k !== 'number' || k < 1) {
        return res.status(400).json({ error: 'Invalid k value' });
      }

      const allCoordinates = await storage.getCoordinates();
      
      if (k > allCoordinates.length) {
        return res.status(400).json({ error: 'k is greater than available coordinates' });
      }

      const shuffled = [...allCoordinates].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, k);
      const selectedIds = selected.map(c => c.id);

      let config = await storage.getActiveConfig();
      
      if (!config) {
        config = await storage.createActiveConfig(k, 500, 30, selectedIds);
      } else {
        config = await storage.updateActiveConfig({
          k,
          activeCoordinateIds: selectedIds,
          lastRotated: new Date(),
        });
      }

      if (config) {
        broadcastToAll({
          type: 'config_update',
          data: config,
        });
        broadcastToAll({
          type: 'active_coordinates_update',
          data: selected,
        });
      }

      res.json(config);
    } catch (error) {
      console.error('Error generating random coordinates:', error);
      res.status(500).json({ error: 'Failed to generate random coordinates' });
    }
  });

  return httpServer;
}
