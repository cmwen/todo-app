import { WebSocketServer, WebSocket } from 'ws';
import { TodoDatabase } from './database/todo-database.js';
import { WebSocketHandler } from './handlers/websocket-handler.js';
import { logger } from './utils/logger.js';
import { ServerMessage } from '@todo-app/shared';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '8080');
const DATABASE_PATH = process.env.DATABASE_PATH || './data/todos.db';

class TodoWebSocketServer {
  private wss: WebSocketServer;
  private db: TodoDatabase;
  private handler: WebSocketHandler;
  private clients: Set<WebSocket> = new Set();

  constructor() {
  this.db = new TodoDatabase(DATABASE_PATH);
    this.wss = new WebSocketServer({ port: PORT });
    this.handler = new WebSocketHandler(this.db, this.broadcast.bind(this));
    
    this.setupEventHandlers();
    logger.info(`WebSocket server starting on port ${PORT}`);
  }

  private setupEventHandlers(): void {
    this.wss.on('connection', (ws, request) => {
      this.handleConnection(ws, request);
    });

    this.wss.on('error', (error) => {
      logger.error('WebSocket server error:', error);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      this.shutdown();
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      this.shutdown();
    });
  }

  private handleConnection(ws: WebSocket, request: any): void {
    const clientIP = request.socket.remoteAddress;
    logger.info(`Client connected from ${clientIP}`);
    
    this.clients.add(ws);

    ws.on('message', async (data) => {
      await this.handler.handleMessage(ws, data as Buffer);
    });

    ws.on('close', (code, reason) => {
      logger.info(`Client disconnected: ${code} ${reason.toString()}`);
      this.clients.delete(ws);
    });

    ws.on('error', (error) => {
      logger.error('WebSocket client error:', error);
      this.clients.delete(ws);
    });

    // Send welcome message or initial todos
    this.sendInitialData(ws);
  }

  private async sendInitialData(ws: WebSocket): Promise<void> {
    try {
      // Send current todos to newly connected client
  const todos = await this.db.listTodos({ limit: 100, offset: 0 });
      const message: ServerMessage = {
        id: 'initial-data',
        type: 'todos_listed',
        payload: { todos, total: todos.length },
        timestamp: Date.now(),
      };

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    } catch (error) {
      logger.error('Error sending initial data:', error);
    }
  }

  private broadcast(message: ServerMessage, excludeClient?: WebSocket): void {
    const messageStr = JSON.stringify(message);
    
    this.clients.forEach((client) => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });

    logger.debug(`Broadcasted message to ${this.clients.size - (excludeClient ? 1 : 0)} clients`, {
      type: message.type,
      messageId: message.id,
    });
  }

  private shutdown(): void {
    logger.info('Shutting down WebSocket server...');
    
    // Close all client connections
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.close(1001, 'Server shutting down');
      }
    });

    // Close WebSocket server
    this.wss.close(() => {
      logger.info('WebSocket server closed');
    });

    // Close database connection
    this.db.close();
    logger.info('Database connection closed');
    
    process.exit(0);
  }

  getStats() {
    return {
      connectedClients: this.clients.size,
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }
}

// Start the server
const server = new TodoWebSocketServer();

// Optional: Add a simple health check endpoint if needed
if (process.env.ENABLE_HTTP_HEALTH_CHECK === 'true') {
  import('http').then(({ createServer }) => {
    const httpServer = createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          ...server.getStats(),
        }));
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    
    httpServer.listen(PORT + 1, () => {
      logger.info(`Health check HTTP server running on port ${PORT + 1}`);
    });
  });
}

export default server;
