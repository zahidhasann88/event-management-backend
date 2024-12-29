# Event Management System API

A NestJS-based API for managing events, attendees, and registrations with real-time updates, caching, and email notifications.

## Features

### Core Features
- Event Management (CRUD)
  - Create and list events
  - Prevent overlapping events
  - Manage attendee capacity
- Attendee Management
  - Register new attendees
  - Unique email validation
- Registration System
  - Register attendees for events
  - Capacity control
  - Duplicate registration prevention
  - List registrations with attendee details

### Advanced Features
- Real-time WebSocket Updates
  - Event capacity notifications
  - New event notifications
- Email Notifications (Bull Queue)
  - Registration confirmation
  - Event reminders
- Redis Caching
  - Event details caching
  - Cache invalidation
- Health Monitoring
  - Database health
  - Redis health
  - Email service health
  - WebSocket health

## Prerequisites

- Node.js (v16+)
- PostgreSQL
- Redis
- SMTP Server (for emails)

## Installation

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Configure environment
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

## Database Setup

```bash
# Create database
createdb event

# Run migrations
npm run migration:run
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
  ```json
  {
    "name": "Tech Conference 2024",
    "description": "Annual tech conference",
    "date": "2024-12-25T09:00:00Z",
    "location": "Convention Center",
    "maxAttendees": 100
  }
  ```
- `GET /events` - List all events
  - Query params: startDate, endDate
- `GET /events/:id` - Get event details
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `GET /events/stats/most-registrations` - Get most popular event

#### Attendees
- `POST /attendees` - Create attendee
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
  ```
- `GET /attendees` - List attendees
  - Query params: search, page, limit
- `GET /attendees/:id` - Get attendee details
- `DELETE /attendees/:id` - Delete attendee

#### Registrations
- `POST /registrations` - Register for event
  ```json
  {
    "eventId": "uuid",
    "attendeeId": "uuid"
  }
  ```
- `GET /registrations/event/:eventId` - List event registrations
- `DELETE /registrations/:id` - Cancel registration

### WebSocket Events

Connect to WebSocket at `ws://localhost:3000`

Events:
- `eventCapacityUpdate` - Event capacity changes
- `newEvent` - New event created
- `eventUpdated` - Event updated
- `eventDeleted` - Event deleted

### Health Check

- `GET /health` - System health status
  - Database connection
  - Redis connection
  - Email service
  - Bull queue
  - WebSocket server

## Features Implementation

### Caching
- Event details cached for 1 hour
- Cache invalidation on updates
- Redis as cache store

### Email Notifications
- Registration confirmation
- Event reminders (24h before)
- Async processing with Bull

### Real-time Updates
- WebSocket for live updates
- Capacity warnings
- Event notifications