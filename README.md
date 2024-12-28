# Event Management System

A NestJS-based API for managing events, attendees, and registrations.

## Features

- Event Management (CRUD operations)
- Attendee Management
- Registration System
- Real-time WebSocket Updates
- Email Notifications
- Redis Caching
- Scheduled Reminders

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
# Edit .env with your configurations

# Start Redis
redis-server

# Start PostgreSQL and create database
createdb event

# Run migrations
npm run migration:run

# Start the application
npm run start:dev
```

## Example API Requests

### Create Event
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Conference 2024",
    "description": "Annual tech conference",
    "date": "2024-12-25T09:00:00Z",
    "location": "Convention Center",
    "maxAttendees": 100
  }'
```

### Create Attendee
```bash
curl -X POST http://localhost:3000/attendees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com"
  }'
```

### Register for Event
```bash
curl -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event-uuid",
    "attendeeId": "attendee-uuid"
  }'
```

## API Documentation

Swagger documentation is available at: `http://localhost:3000/api`

## API Endpoints

### Events
- `POST /events` - Create event
- `GET /events` - List all events
- `GET /events/:id` - Get event details
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Attendees
- `POST /attendees` - Create attendee
- `GET /attendees` - List all attendees
- `GET /attendees/:id` - Get attendee details
- `DELETE /attendees/:id` - Delete attendee

### Registrations
- `POST /registrations` - Register for event
- `GET /registrations/event/:eventId` - List event registrations
- `DELETE /registrations/:id` - Cancel registration

## WebSocket Events

The API provides real-time updates through WebSocket connections:

- `eventCapacityUpdate`: Triggered when event capacity changes (2 or fewer spots remaining)
- `newEvent`: Triggered when a new event is created
- `eventUpdated`: Triggered when an event is updated
- `eventDeleted`: Triggered when an event is deleted

## Configuration

Create a `.env` file based on `.env.example`:

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```