const express = require('express');
const { extractContentFromLinks, ingestData } = require('./dataIngest');
const { createVectors, searchVectors } = require('./vectorDatabase');
const { Configuration, OpenAIApi } = require('openai');
const app = express();
const port = 3000;

const configuration = new Configuration({
    apiKey: 'sk-',
});
const openai = new OpenAIApi(configuration);

let contents = [];
let index;

app.get('/', (req, res) => {
    res.send('Hello, this is the RAG system!');
});

app.get('/query', async (req, res) => {
    const query = req.query.q;
    const embeddingResponse = await openai.createEmbedding({
        input: query,
        model: 'text-embedding-ada-002'
    });
    const embedding = embeddingResponse.data.embedding;
    const k = 5;
    const [distances, indices] = await index.search(embedding, k);

    const responses = indices.map(i => contents[i]);
    res.json(responses);
});

app.listen(port, async () => {
    contents = await extractContentFromLinks(await ingestData());
    index = await createVectors(contents);
    console.log(`Server is running at http://localhost:${port}`);
});


