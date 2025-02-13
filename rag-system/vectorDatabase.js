const {Configuration, OpenAIAPI} = require('openai');
const faiss = require('faiss');
const config = require('./config');

const openai = new OpenAIAPI(new Configuration({
    apiKey: config.openaiApiKey
}));

async function createVectors(contents) {
    const vectors = [];
    for(const content of contents){
        const embeddingResponse = await openai.createEmbedding({
            input: content,
            model: 'text-embedding-ada-002',
        });

        const embedding = embeddingResponse.data.embedding;
        vectors.push(embedding);
    }

    const dimension = vectors[0].length;
    const index = faiss.IndexFlatL2(dimension);
    vectors.forEach(vector => {
        index.add(vector);
    });
    return index;
}

function searchVectors(index, embedding, k) {
        const [distances, indices] = index.search(embedding, k);
        return {distances, indices};
}

module.exports = {
    createVectors,
    searchVectors
};


