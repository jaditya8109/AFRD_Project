const cheerio = require('cheerio');
const request = require('request');
var express = require('express');  
var app     = express(); 
const axios = require('axios');
var parse = require('csv-parse');
const fs = require('fs');

// scrapping 

//paste ur URL below
const productURL = 'https://www.amazon.in/Redmi-8A-Dual-Blue-Storage/dp/B07X4R63DF/ref=psdc_1805560031_t1_B01MEGHPZ4'
//To save in csv

const writeStream = fs.createWriteStream('data.csv');

var dataa = [];
request(productURL , (error, response, html) => {
  if (!error && response.statusCode == 200) {
    const $ = cheerio.load(html);
    
    // Load the review comments
    const reviews = $('.review');
    reviews.each((i, w) => {
        // Find the review comments
        const textReview = $(w).find('.review-text').text().replace(/\s\s+/g, '');
        
        //printing on console
        // console.log(textReview);

        // Write Row To CSV
        writeStream.write(`${textReview}\n`);
        //pushing data in array
        dataa.push(`${textReview}` );
    });
    
    console.log(dataa);
    console.log('data saved!');
    for(var i = 0; i<dataa.length; i++){
      // calling model api using axios

          axios.get('https://afrd.herokuapp.com/', {
            params: {
              query: dataa[i]
            }
          }).then ((data)=>console.log(data.data))
    }
  }
});

// transfering data from csv to array

// var csvData=[];
// fs.createReadStream('data.csv')
//     .pipe(parse({delimiter: ':'}))
//     .on('data', function(csvrow) {
//         // console.log(csvrow);
//         //do something with csvrow
//         csvData.push(csvrow);        
//     })
//     .on('end',function() {
//       //do something with csvData
//       // console.log(csvData[2][0]);
//       for (var i = 0; i < csvData.length; i++) {
//         // calling model api using axios

//           axios.get('https://afrd.herokuapp.com/', {
//             params: {
//               query: csvData[i][0]
//             }
//           }).then ((data)=>console.log(data.data))
//         console.log(csvData[i][0]);
//       }
//     });

// calculation



  app.listen(8000 , () => {
    console.log('listening to port 8000');
  });