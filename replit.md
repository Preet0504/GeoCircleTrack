# Real-Time Geolocation Tracking Application

## Overview
A real-time geolocation web application with admin and user modes featuring dynamic coordinate management and proximity-based visibility. Built with React, Express, PostgreSQL, WebSockets, and Leaflet maps.

## Project Status
**Current State**: MVP Complete - All core features implemented and functional
**Last Updated**: October 13, 2025

## Recent Changes
- **October 13, 2025**: 
  - Initial implementation of complete geolocation tracking system
  - Database schema with coordinates and active config tables
  - WebSocket server for real-time communication
  - Admin controls for coordinate management
  - User proximity-based coordinate visibility
  - Fixed critical map click handler closure bug using refs

## Tech Stack
### Frontend
- React with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Leaflet for interactive maps
- Shadcn UI components
- Tailwind CSS for styling

### Backend
- Express.js
- PostgreSQL (Neon) for persistence
- Drizzle ORM
- WebSocket (ws) for real-time updates
- Zod for validation

## Project Architecture

### Database Schema
**Coordinates Table:**
- id (UUID primary key)
- latitude (double precision)
- longitude (double precision)
- createdAt (timestamp)

**Active Config Table:**
- id (UUID primary key)
- k (integer) - number of random coordinates to display
- radius (double precision) - radius in meters
- timeInterval (integer) - auto-rotation interval in seconds
- activeCoordinateIds (varchar array) - IDs of currently active coordinates
- lastRotated (timestamp)

### API Endpoints
- `GET /api/coordinates` - Fetch all coordinates
- `POST /api/coordinates` - Create new coordinate
- `DELETE /api/coordinates/:id` - Remove coordinate
- `GET /api/config` - Get active configuration
- `PATCH /api/config` - Update configuration
- `POST /api/config/generate` - Generate random k coordinates

### WebSocket Communication
Real-time updates via WebSocket at `/ws`:
- `location_update` - User location changes
- `config_update` - Configuration updates
- `coordinates_update` - Coordinate list changes
- `active_coordinates_update` - Active coordinates regenerated

## Features

### Admin Mode
1. **Coordinate Management**
   - Add coordinates by clicking on map (toggle add mode)
   - View all coordinates in scrollable list
   - Remove coordinates with delete button
   - Visual markers: Blue for all, Purple for active

2. **Random Coordinate Generation**
   - Set k value (number of random coordinates)
   - Generate random k coordinates from database
   - Active coordinates shown with purple markers and radius circles

3. **Radius Configuration**
   - Slider control (50-5000 meters)
   - Visual circle overlays on map
   - Real-time radius updates

4. **Auto-Rotation**
   - Configurable time interval (seconds)
   - Automatic regeneration of random k coordinates
   - Start/Stop controls
   - Real-time broadcast to all clients

### User Mode
1. **Proximity-Based Visibility**
   - Coordinates visible only when inside radius
   - Real-time distance calculation using Haversine formula
   - Status indicator (Inside/Outside radius)

2. **Distance Metrics**
   - Nearest coordinate distance display
   - Live proximity status updates
   - Visible coordinates list (filtered by radius)

### Location Tracking
1. **Permission Management**
   - Required location access for app usage
   - Permission request modal on startup
   - Clear error states for denied permissions

2. **Real-Time Updates**
   - Continuous location tracking using Geolocation API
   - User position marker on map (teal color)
   - Accuracy circle visualization
   - WebSocket broadcast of location changes

## Key Implementation Details

### Map Click Handler Fix
- Uses refs to prevent closure stale state issues
- `isAddingCoordinateRef` and `onMapClickRef` keep click handler updated
- Ensures toggle between add/normal mode works correctly

### Distance Calculation
- Haversine formula for accurate lat/lng distance
- Returns distance in meters
- Used for proximity detection and radius filtering

### Real-Time Synchronization
- WebSocket broadcasts on coordinate changes
- Config updates propagate to all connected clients
- Query invalidation for React Query cache updates
- Auto-rotation interval managed client-side

## User Preferences
- Dark mode optimized (default theme)
- Map-centric UI design
- Minimal, functional controls
- Real-time feedback for all actions

## Running the Project
1. Start development server: `npm run dev`
2. Database migrations: `npm run db:push`
3. Access at: http://localhost:5000

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (automatically configured)
- `SESSION_SECRET` - Session secret for Express
- Other Neon database variables auto-configured

## Known Limitations
- Location permission requires manual browser approval
- WebSocket requires page refresh on connection loss
- Map defaults to San Francisco coordinates (37.7749, -122.4194)

## Future Enhancements
- Coordinate history and analytics
- Coordinate grouping/categorization
- Geofencing notifications
- Admin activity logs
- Export/import coordinate data (CSV/JSON)
- User authentication and sessions
- Custom map markers and styling
- Offline support with service workers
