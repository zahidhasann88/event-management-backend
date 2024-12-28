import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { EventGateway } from '../../modules/websocket/gateways/event.gateway';

@Injectable()
export class WebSocketHealthIndicator extends HealthIndicator {
  constructor(private eventGateway: EventGateway) {
    super();
  }

  async checkHealth(key: string): Promise<HealthIndicatorResult> {
    const server = this.eventGateway.server;
    const isHealthy = !!server && server.sockets && this.eventGateway.isHealthy();

    return this.getStatus(key, isHealthy, {
      connectedClients: this.eventGateway.getConnectedClientsCount(),
    });
  }
} 