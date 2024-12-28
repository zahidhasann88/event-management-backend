# Event Management System

A NestJS-based API for managing events, attendees, and registrations with real-time updates and email notifications.

## Features

- Event Management (CRUD operations)
- Attendee Management
- Registration System with capacity control
- Real-time WebSocket Updates
- Email Notifications using Bull Queue
- Redis Caching
- Scheduled Event Reminders
- Health Monitoring

## Prerequisites

- Node.js (v16+)
- PostgreSQL
- Redis

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

## Configuration

Update `.env` with your settings:

```env
# Server
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=event

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_CACHE_TTL=3600

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@events.com

# Reminder
REMINDER_BEFORE_EVENT_HOURS=24
```

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

Swagger documentation available at: `http://localhost:3000/api`

### Core Endpoints

#### Events
- `POST /events` - Create event
- `GET /events` - List all events
- `GET /events/:id` - Get event details
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `GET /events/stats/most-registrations` - Get event with most registrations

#### Attendees
- `POST /attendees` - Create attendee
- `GET /attendees` - List all attendees
- `GET /attendees/:id` - Get attendee details
- `DELETE /attendees/:id` - Delete attendee
- `GET /attendees/stats/multiple-registrations` - Get attendees with multiple events

#### Registrations
- `POST /registrations` - Register for event
- `GET /registrations/event/:eventId` - List event registrations
- `DELETE /registrations/:id` - Cancel registration

### Health Check

- `GET /health` - Check system health status (Database, Redis, Bull, Email, WebSocket)

## WebSocket Events

Connect to WebSocket at `ws://localhost:3000`

### Events
- `eventCapacityUpdate` - Notifies when event capacity changes
- `newEvent` - Notifies when new event is created
- `eventUpdated` - Notifies when event is updated
- `eventDeleted` - Notifies when event is deleted

### Example WebSocket Client
```javascript
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('eventCapacityUpdate', (data) => {
  console.log('Event capacity update:', data);
});

// Join specific event room
socket.emit('joinEvent', 'event-uuid');
```

## Features Implementation

### Caching
- Event details cached for 1 hour
- Cache invalidation on updates/deletes
- Redis used as cache store

### Email Notifications
- Registration confirmation
- Event reminders (24h before)
- Registration cancellation
- Async processing using Bull Queue

### Scheduling
- Automated event reminders
- Expired events cleanup
- Health checks

## Development

```bash
# Generate migration
npm run migration:generate

# Run migrations
npm run migration:run

# Run tests
npm run test

# Run e2e tests
npm run test:e2e
```

## Project Structure
```
src/
├── config/                 # Configuration
├── core/                  # Core modules
├── modules/               # Feature modules
│   ├── events/
│   ├── attendees/
│   ├── registrations/
│   ├── email/
│   └── websocket/
└── shared/               # Shared resources
```

## License

[MIT licensed](LICENSE)