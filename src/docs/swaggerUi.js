const express = require('express');
const router = express.Router();
const openapiSpec = require('./openapi');

// Endpoint para obtener la especificación OpenAPI en JSON
router.get('/spec', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(openapiSpec);
});

// UI Interactiva de Swagger cargada con CDN (Cero dependencias npm adicionales)
router.get('/', (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>CoreCredential - API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; font-family: sans-serif; }
        .topbar { display: none; }
        .swagger-ui .info { margin: 25px 0; }
        .swagger-ui .info .title { font-size: 28px; color: #1e293b; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
    window.onload = function() {
        window.ui = SwaggerUIBundle({
            url: "/api/docs/spec",
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
            ],
            layout: "BaseLayout",
            defaultModelsExpandDepth: -1,
            docExpansion: "list"
        });
    };
    </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

module.exports = router;
