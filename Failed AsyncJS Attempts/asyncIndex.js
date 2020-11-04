const cheerio = require('cheerio');
const request = require('request');
var express = require('express');  
var app     = express(); 
const axios = require('axios');
var parse = require('csv-parse');
const fs = require('fs');

//paste ur URL below
// const productURL = 'https://www.amazon.in/Redmi-8A-Dual-Blue-Storage/dp/B07X4R63DF/ref=psdc_1805560031_t1_B01MEGHPZ4'
//To save in csv
const writeStream = fs.createWriteStream('data.csv');


function scrapping(){
    const dataa = [];
    return new Promise((resolve) => {
        //paste ur URL below
        const productURL = 'https://www.amazon.in/Redmi-8A-Dual-Blue-Storage/dp/B07X4R63DF/ref=psdc_1805560031_t1_B01MEGHPZ4'
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
            resolve(dataa);
        })
        
    }) 
    

};

const mlOutput = async (arey)=>{
    console.log(arey);
    const temp = arey.map(elem => {
        return axios.get('https://afrd.herokuapp.com/', {
            params: {
            query:elem
            }
        }).then ((resp)=> {
            return resp.data;
        })
    })

    const values = await Promise.all(temp)
    console.log(values)

    // for(var i = 0; i<arey.length; i++){
    //     // calling model api using axios
        
    //   }
    const prediction = [];
    const confidence = [];

    values.forEach(val => {
        prediction.push(val.prediction);
        confidence.push(val.confidence);
    })
    
    return [prediction, confidence];
};

async function getoutput(){
    const dataa = await scrapping();
    const [prediction, confidence] = await mlOutput(dataa);
    console.log(prediction, confidence);
};

getoutput();

