# API Documentation Tools Recommendations

## Automatic API Documentation Generation

Here are the recommended tools for automatically generating and maintaining API documentation:

## 1. OpenAPI/Swagger (Recommended)

### Why Choose OpenAPI?
- Industry standard for REST API documentation
- Excellent tooling ecosystem
- Interactive documentation with try-it-out features
- Code generation capabilities
- Wide community support

### Implementation Steps:

#### Install Dependencies
```bash
npm install swagger-jsdoc swagger-ui-express
npm install --save-dev @types/swagger-jsdoc @types/swagger-ui-express
```

#### Basic Setup Example
```javascript
// server/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RSS Reader API',
      version: '1.0.0',
      description: 'A comprehensive RSS reader and news curation API',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
  },
  apis: ['./server/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
```

#### Add to Express Server
```javascript
// In server.js
import { specs, swaggerUi } from './swagger.js';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

#### Document Endpoints with JSDoc Comments
```javascript
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current status of the API server
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/api/health', (req, res) => {
  // endpoint implementation
});
```

## 2. Postman Collections

### Benefits:
- Easy to share with team members
- Built-in testing capabilities
- Environment variable support
- Automatic documentation generation

### Setup:
1. Create a Postman workspace
2. Import your API endpoints
3. Add examples and descriptions
4. Generate documentation from collection
5. Publish to Postman's public documentation

### Export Collection:
```bash
# Generate collection.json from your Postman workspace
# Then version control it in your repository
```

## 3. Insomnia REST Client

### Benefits:
- Clean, developer-friendly interface
- GraphQL support (for future use)
- Plugin ecosystem
- Git sync capabilities

### Setup:
1. Create workspace in Insomnia
2. Import/create your API requests
3. Export collection for version control

## 4. API Blueprint + Aglio

### Benefits:
- Markdown-based documentation
- Beautiful HTML output
- Easy to write and maintain

### Installation:
```bash
npm install -g aglio
```

### Usage:
```bash
# Create API.md with API Blueprint syntax
aglio -i API.md -o documentation.html
```

## 5. GitBook or Notion

### Benefits:
- Rich text editing
- Team collaboration
- Version control integration
- Beautiful presentation

### Use Case:
- Comprehensive documentation beyond just API
- User guides and tutorials
- Architecture documentation

## Recommended Implementation Strategy

### Phase 1: Quick Start (Immediate)
1. **Use the manual documentation** I created as your foundation
2. **Set up Postman collection** for immediate team sharing
3. **Create a simple README** with basic endpoint information

### Phase 2: Automated Documentation (Next Sprint)
1. **Implement OpenAPI/Swagger** for your REST endpoints
2. **Add JSDoc comments** to existing endpoints
3. **Set up automated documentation generation** in your build process

### Phase 3: Comprehensive Documentation (Future)
1. **Document WebSocket messages** using AsyncAPI specification
2. **Add integration examples** and SDKs
3. **Create user guides** and tutorials

## WebSocket Documentation Tools

Since your API heavily uses WebSockets, consider these specialized tools:

### AsyncAPI
- Similar to OpenAPI but for event-driven APIs
- Supports WebSocket documentation
- Growing ecosystem

```yaml
# asyncapi.yaml example
asyncapi: 2.6.0
info:
  title: RSS Reader WebSocket API
  version: 1.0.0
channels:
  /:
    subscribe:
      message:
        oneOf:
          - $ref: '#/components/messages/AddFeed'
          - $ref: '#/components/messages/UpdateFeed'
```

## Documentation Automation in CI/CD

### GitHub Actions Example:
```yaml
name: Generate API Documentation
on:
  push:
    branches: [main]
jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Generate OpenAPI docs
        run: |
          npm install
          npm run generate-docs
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

## Best Practices

1. **Keep documentation close to code** - Use JSDoc comments
2. **Version your API** - Include version numbers in URLs
3. **Provide examples** - Real request/response examples
4. **Test your documentation** - Ensure examples work
5. **Automate updates** - Generate docs from code when possible
6. **Include error scenarios** - Document all possible error responses

## Immediate Next Steps

1. **Choose OpenAPI/Swagger** for REST endpoints
2. **Set up basic Swagger UI** at `/api-docs`
3. **Document your existing endpoints** with JSDoc comments
4. **Create Postman collection** for team sharing
5. **Set up automated documentation generation** in your build process

This approach will give you professional, maintainable API documentation that grows with your application.