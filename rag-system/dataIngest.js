const axios = require('axios');
const cheerio = require('cheerio');
const kafka = require('kafka-node');
const fs = require('fs');
const csvParser = require('csv-parser');
const config = require('./config');
const { group } = require('console');
const { resolve } = require('path');
const { Models } = require('openai/resources/models.mjs');

let newsLinks = [];

function ingestFromKafka() {

    const kafkaClient = new kafka.KafkaClient({
    kafkaHost: config.kafkaHost,
    sasl:{
        mechanism: 'plain',
        username: config.kafkaSaslUsername,
        password: config.kafkaSaslPassword,
    },
    ssl: true,
    });

    const consumer = new kafka.Consumer(
        kafkaClient,
        [{ topic: 'news', partition: 0}],
        { groupId:'test-task-group' }
    );

    consumer.on('message', message => {
        const newsLink = message.value;
        newsLinks.push(newsLink);
    });

    return new Promise(resolve => {
        consumer.on('end', () => resolve(newsLinks));
    });
}

function ingestFromCSV(filePath){
    return new Promise((resolve, reject) =>{
        fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', row => {
            newsLinks.push(row.link);
        })
        .on('end', () => resolve(newsLinks))
        .on('error', reject);
    })
}

async function ingestData() {
return ingestFromCSV('./articles_dataset.csv');
}

async function extractContentFromLinks(links) {
    const contents = [];
    for(const link of links){
        const response = await axios.get(link);
        const $ = cheerio.load(response.data);
        const text = $('body').text();
        contents.push(text);
    }
    return contents;
}

module.exports = {
    ingestData,
    extractContentFromLinks
};