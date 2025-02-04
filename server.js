const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Set headers to enable cross-origin isolation
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '..', 'Goguanco-Pascual-Zaldivar_IPTL_PT1')));

// Serve index.html explicitly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Goguanco-Pascual-Zaldivar_IPTL_PT1', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
