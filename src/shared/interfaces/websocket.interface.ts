export interface WebSocketResponse<T> {
  event: string;
  data: T;
  timestamp: string;
}

export interface CapacityUpdatePayload {
  eventId: string;
  remainingSpots: number;
} 