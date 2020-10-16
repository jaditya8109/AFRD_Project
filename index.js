const cheerio = require('cheerio');
const request = require('request');
//paste ur URL below
const productURL = 'https://www.amazon.in/Redmi-8A-Dual-Blue-Storage/dp/B07X4R63DF/ref=psdc_1805560031_t1_B01MEGHPZ4'
//To save in csv
const fs = require('fs');
const writeStream = fs.createWriteStream('data.csv');

request(productURL , (error, response, html) => {
  if (!error && response.statusCode == 200) {
    const $ = cheerio.load(html);
    
    // Load the review comments
    const reviews = $('.review');
    reviews.each((i, w) => {
        // Find the review comments
        const textReview = $(w).find('.review-text').text().replace(/\s\s+/g, '');
        // stars
        const stars = $(w).find('.review-rating').text();
        // name 
        const name = $(w).find('.a-profile-name').text();
        
        //printing on console
        console.log(textReview);

        // Write Row To CSV
        writeStream.write(`${textReview}, ${stars}, ${name} \n`);
    });
    console.log('Damn!');
  }
});