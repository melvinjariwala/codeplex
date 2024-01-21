const { default: axios } = require('axios');
const express = require('express');
const app = express();
const port = 3000;

// Serve static files from the client folder
app.use(express.static('client'));

app.get("/api/users/:username", async (req, res) => {
    try {
        const { data } = await axios.get(`https://api.github.com/users/${req.params.username}`)
        res.json(data)
    } catch (error) {
        console.log(error)
    }
})

app.get("/api/users/:username/repos", async (req, res) => {
    try {
        const { data } = await axios.get(`https://api.github.com/users/${req.params.username}/repos`)
        res.json(data)
    } catch (error) {
        console.log(error)
    }
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
