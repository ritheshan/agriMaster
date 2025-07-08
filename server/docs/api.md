# AgriMaster API Documentation

## Overview
This is the API documentation for the AgriMaster smart agriculture platform.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All API endpoints require authentication except login and registration.

## Endpoints

### Authentication
- `POST /auth/send-otp` - Send OTP for login
- `POST /auth/verify-otp` - Verify OTP and login
- `GET /auth/google/url` - Get Google OAuth URL
- `GET /auth/google/callback` - Handle Google OAuth callback

### User Management
- `GET /me` - Get current user profile
- `PUT /me` - Update user profile

### Field Management
- `GET /fields` - Get all fields
- `POST /fields` - Create new field
- `GET /fields/:id` - Get single field
- `PUT /fields/:id` - Update field
- `POST /fields/:id/health` - Add health record

### Crop Management
- `GET /crops/calendar` - Get crop calendar
- `POST /crops/records` - Create crop record
- `GET /crops/records/:id` - Get crop record
- `PUT /crops/records/:id/growth-stage` - Update growth stage
- `POST /crops/records/:id/growth-log` - Add growth log
- `POST /crops/records/:id/task` - Add task
- `GET /crops/notifications` - Get notifications

### Weather
- `GET /weather/fields/:fieldId/weather` - Get field weather
- `GET /weather/fields/:fieldId/weather/history` - Get weather history

### Community
- `GET /community/posts` - Get posts
- `POST /community/posts` - Create post
- `POST /community/posts/:id/comments` - Add comment
- `PUT /community/posts/:id/like` - Toggle like

### ML Services
- `GET /ml/health` - ML service health check
- `POST /ml/disease/detect` - Disease detection (placeholder)
- `POST /ml/crop/predict` - Crop prediction (placeholder)
- `POST /ml/yield/predict` - Yield prediction (placeholder)

## Error Handling
All endpoints return standardized error responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": ["Additional error details"]
}
```

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Authentication endpoints have additional rate limiting
