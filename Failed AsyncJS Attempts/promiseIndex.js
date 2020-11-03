const cheerio = require('cheerio');
const request = require('request');
var express = require('express');  
var app     = express(); 
const axios = require('axios');
var parse = require('csv-parse');
const fs = require('fs');
const { resolve } = require('path');

//paste ur URL below
// const productURL = 'https://www.amazon.in/Redmi-8A-Dual-Blue-Storage/dp/B07X4R63DF/ref=psdc_1805560031_t1_B01MEGHPZ4'
//To save in csv
const writeStream = fs.createWriteStream('data.csv');

var dataa = [];
var prediction = [];
var confidence = [];
function scrapping(productURL){
    return new Promise((resolve)=>{
        //paste ur URL below
        // const productURL = 'https://www.amazon.in/Redmi-8A-Dual-Blue-Storage/dp/B07X4R63DF/ref=psdc_1805560031_t1_B01MEGHPZ4'
        request(productURL , (error, response, html) => {
            if (!error && response.statusCode == 200) {
                const $ = cheerio.load(html);
                // Load the review comments
                const reviews = $('.review');
                    reviews.each((i, w) => {
                        // Find the review comments
                        const textReview = $(w).find('.review-text').text().replace(/\s\s+/g, '');
                        // Write Row To CSV
                        writeStream.write(`${textReview}\n`);
                        //pushing data in array
                        dataa.push(`${textReview}` );
                       
                    });
                    
            }
            console.log(dataa);
            console.log('data saved!');
        })
        resolve();
    }) 
    

};

function mlOutput(arey){
    console.log("dataa");
    for(var i = 0; i<arey.length; i++){
        // calling model api using axios
        axios.get('https://afrd.herokuapp.com/', {
            params: {
            query: arey[i]
            }
        }).then ((data)=> {
        console.log(data.data)
        console.log("hello");
        prediction.push(data.data.prediction);
        confidence.push(data.data.confidence);
        })
      }

};

scrapping('https://www.amazon.in/Redmi-8A-Dual-Blue-Storage/dp/B07X4R63DF/ref=psdc_1805560031_t1_B01MEGHPZ4')
    .then((value)=>mlOutput(value));



