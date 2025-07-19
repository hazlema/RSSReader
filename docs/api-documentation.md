# RSS Reader API Documentation

## Overview

The RSS Reader API provides endpoints for managing RSS feeds, categories, stories, and retrieving thumbnails. The API uses WebSocket connections for real-time updates and REST endpoints for specific operations.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Content Types

- **Request**: `application/json`
- **Response**: `application/json`

## WebSocket Connection

### Connection URL
```
ws://localhost:3001
```

### Message Format
All WebSocket messages follow this structure:
```json
{
  "type": "message_type",
  "payload": {
    // Message-specific data
  }
}
```

---

## REST Endpoints

### Health Check

#### GET `/api/health`

Check if the API server is running and responsive.

**Request:**
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-16T20:32:05.123Z"
}
```

**Status Codes:**
- `200 OK` - Server is healthy

---

### Thumbnail Retrieval

#### GET `/api/thumbnail`

Fetch a thumbnail image URL from a given webpage URL.

**Request:**
```http
GET /api/thumbnail?url=https://example.com/article
```

**Parameters:**
- `url` (required, string) - The URL of the webpage to extract thumbnail from

**Response (Success):**
```json
{
  "thumbnail": "https://example.com/images/thumbnail.jpg"
}
```

**Response (No Thumbnail Found):**
```json
{
  "thumbnail": null
}
```

**Status Codes:**
- `200 OK` - Request processed successfully
- `400 Bad Request` - Invalid or missing URL parameter
- `404 Not Found` - Failed to fetch the webpage
- `500 Internal Server Error` - Server error during processing
- `503 Service Unavailable` - Network error or connection refused
- `504 Gateway Timeout` - Request timeout

**Error Response:**
```json
{
  "error": "Invalid URL format"
}
```

**Example Requests:**
```bash
# Valid request
curl "http://localhost:3001/api/thumbnail?url=https://example.com/article"

# Invalid URL
curl "http://localhost:3001/api/thumbnail?url=invalid-url"
```

---

### Database Debug

#### GET `/api/db-dump`

Retrieve a complete dump of the database for debugging purposes.

**Request:**
```http
GET /api/db-dump
```

**Response:**
```json
{
  "feeds": [
    {
      "uid": 1,
      "name": "Example Feed",
      "url": "https://example.com/rss",
      "logo_url": "https://example.com/logo.png",
      "categories_uid": 1,
      "last": "2025-01-16T20:30:00.000Z",
      "active": 1,
      "category_name": "Technology"
    }
  ],
  "categories": [
    {
      "uid": 1,
      "title": "Technology"
    }
  ],
  "stories": [
    {
      "UID": 1,
      "feed_name": "Example Feed",
      "feed_logo_url": "https://example.com/logo.png",
      "source_url": "https://example.com/rss",
      "categories_uid": 1,
      "category_name": "Technology",
      "title": "Example Article",
      "link": "https://example.com/article",
      "visible": 1,
      "published": 0,
      "last": "2025-01-16T20:30:00.000Z"
    }
  ],
  "timestamp": "2025-01-16T20:32:05.123Z"
}
```

**Status Codes:**
- `200 OK` - Database dump retrieved successfully
- `500 Internal Server Error` - Database error

---

## WebSocket Messages

### Client to Server Messages

#### Add Feed
```json
{
  "type": "add_feed",
  "payload": {
    "name": "Example Feed",
    "url": "https://example.com/rss",
    "categories_uid": 1,
    "logo_url": "https://example.com/logo.png"
  }
}
```

#### Update Feed
```json
{
  "type": "update_feed",
  "payload": {
    "uid": 1,
    "name": "Updated Feed Name",
    "url": "https://example.com/rss",
    "active": 1,
    "categories_uid": 1,
    "logo_url": "https://example.com/logo.png"
  }
}
```

#### Delete Feed
```json
{
  "type": "delete_feed",
  "payload": {
    "uid": 1
  }
}
```

#### Add Category
```json
{
  "type": "add_category",
  "payload": {
    "title": "New Category"
  }
}
```

#### Update Category
```json
{
  "type": "update_category",
  "payload": {
    "uid": 1,
    "title": "Updated Category"
  }
}
```

#### Delete Category
```json
{
  "type": "delete_category",
  "payload": {
    "uid": 1
  }
}
```

#### Update Story Visibility
```json
{
  "type": "update_story_visibility",
  "payload": {
    "uid": 1,
    "visible": true
  }
}
```

#### Update Story Published Status
```json
{
  "type": "update_story_published",
  "payload": {
    "uid": 1,
    "published": true
  }
}
```

#### Refresh All Feeds
```json
{
  "type": "refresh_feeds"
}
```

#### Purge Stories
```json
{
  "type": "purge_all_stories"
}
```

```json
{
  "type": "purge_category_stories",
  "payload": {
    "categories_uid": 1
  }
}
```

```json
{
  "type": "purge_old_stories",
  "payload": {
    "days": 7
  }
}
```

```json
{
  "type": "purge_source_stories",
  "payload": {
    "source_uid": 1
  }
}
```

### Server to Client Messages

#### Initial Data
```json
{
  "type": "initial_data",
  "data": {
    "feeds": [...],
    "categories": [...],
    "stories": [...]
  }
}
```

#### Data Updates
```json
{
  "type": "feeds_updated",
  "data": [...]
}
```

```json
{
  "type": "categories_updated",
  "data": [...]
}
```

```json
{
  "type": "stories_updated",
  "data": [...]
}
```

#### Refresh Status
```json
{
  "type": "refresh_started"
}
```

```json
{
  "type": "refresh_completed",
  "data": {
    "newStoriesCount": 5
  }
}
```

#### Purge Completion
```json
{
  "type": "purge_completed",
  "data": {
    "deletedCount": 10,
    "type": "all"
  }
}
```

#### Error Messages
```json
{
  "type": "error",
  "message": "Error description"
}
```

---

## Data Models

### Feed
```json
{
  "uid": 1,
  "name": "Feed Name",
  "url": "https://example.com/rss",
  "logo_url": "https://example.com/logo.png",
  "categories_uid": 1,
  "last": "2025-01-16T20:30:00.000Z",
  "active": 1,
  "category_name": "Category Name"
}
```

### Category
```json
{
  "uid": 1,
  "title": "Category Name"
}
```

### Story
```json
{
  "UID": 1,
  "feed_name": "Feed Name",
  "feed_logo_url": "https://example.com/logo.png",
  "source_url": "https://example.com/rss",
  "categories_uid": 1,
  "category_name": "Category Name",
  "title": "Story Title",
  "link": "https://example.com/article",
  "visible": 1,
  "published": 0,
  "last": "2025-01-16T20:30:00.000Z"
}
```

---

## Error Handling

### HTTP Status Codes

- `200 OK` - Request successful
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable
- `504 Gateway Timeout` - Request timeout

### Error Response Format

```json
{
  "error": "Error message describing what went wrong"
}
```

### WebSocket Error Format

```json
{
  "type": "error",
  "message": "Error message describing what went wrong"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

---

## CORS

CORS is enabled for the following origins:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

---

## Development Notes

### Database
- Uses SQLite database stored at `server/rss_reader.db`
- Automatic feed polling every 10 minutes
- Stories are automatically deduplicated by URL

### WebSocket Connection
- Automatic reconnection on disconnect
- Real-time updates for all data changes
- Broadcast to all connected clients

### Thumbnail Extraction
- Supports Open Graph images
- Twitter card images
- Fallback to feed logos
- 70-second timeout for requests
- Caching to prevent duplicate requests

---

## Future Enhancements

- Authentication and authorization
- Rate limiting
- API versioning
- Pagination for large datasets
- Webhook support
- Export/import functionality