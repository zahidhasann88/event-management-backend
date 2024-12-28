import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { Event } from '../../events/entities/event.entity';
import { EVENT_WEBSOCKET_EVENTS } from 'src/shared/constants/event.constants';
import { WebSocketResponse, CapacityUpdatePayload } from 'src/shared/interfaces/websocket.interface';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinEvent')
  handleJoinEvent(client: Socket, eventId: string) {
    client.join(`event-${eventId}`);
  }

  @SubscribeMessage('leaveEvent')
  handleLeaveEvent(client: Socket, eventId: string) {
    client.leave(`event-${eventId}`);
  }

  notifyEventCapacityUpdate(eventId: string, remainingSpots: number): void {
    const payload: WebSocketResponse<CapacityUpdatePayload> = {
      event: EVENT_WEBSOCKET_EVENTS.CAPACITY_UPDATE,
      data: { eventId, remainingSpots },
      timestamp: new Date().toISOString(),
    };
    this.server.to(`event-${eventId}`).emit(EVENT_WEBSOCKET_EVENTS.CAPACITY_UPDATE, payload);
  }

  notifyNewEventCreated(eventData: any) {
    this.server.emit('newEvent', {
      event: eventData,
      timestamp: new Date().toISOString(),
    });
  }

  notifyEventUpdated(event: Event) {
    this.server.emit('eventUpdated', {
      event,
      timestamp: new Date().toISOString(),
    });
  }

  notifyEventDeleted(eventId: string) {
    this.server.emit('eventDeleted', {
      eventId,
      timestamp: new Date().toISOString(),
    });
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  isHealthy(): boolean {
    return this.server && this.server.sockets && true;
  }
} 