const express = require('express');
const app = express();

// Routes
app.get('/', (req, res) => {
    res.send("Lunatech code test: Country - Airport API");
})


app.listen(8445, () => console.log("Listening on port 8445..."));