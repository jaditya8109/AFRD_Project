const cheerio = require('cheerio');
const request = require('request');
var express = require('express');  
var app     = express(); 
const axios = require('axios');
var parse = require('csv-parse');
const fs = require('fs');

// scrapping 

//paste ur URL below
const productURL = 'https://www.amazon.in/U-S-Polo-Assn-I638-978-PL_Blue-Melange_Large/dp/B0793LFJZP?pd_rd_w=JGKKj&pf_rd_p=278a95ed-d2b3-4cce-a02e-3075364244d4&pf_rd_r=N1MKV0R62JCJF39F08QC&pd_rd_r=3043a8ea-fe4d-4ead-a9bd-1e82d8ad1da3&pd_rd_wg=zfqkY'
//To save in csv

const writeStream = fs.createWriteStream('data.csv');

var dataa = [];
var prediction = [];
var confidence = [];
var result = 0;
var numb = 0;
fakeReview = 0;
request(productURL ,async  (error, response, html) => {
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
    // for(var i = 0; i<dataa.length; i++){
    //   // calling model api using axios

    //       axios.get('https://afrd.herokuapp.com/', {
    //         params: {
    //           query: dataa[i]
    //         }
    //       }).then ((data)=> {
    //       console.log(data.data)
    //       prediction.push(data.data.prediction);
    //       confidence.push(data.data.confidence);
    //       })
    // }
      
      const temp = dataa.map(async (elem) => {
          return  axios.get("https://afrd.herokuapp.com", {
              params: {
                query : elem
            }
        }).then(resp=>resp.data)
    })
      const values = await Promise.all(temp);
      values.forEach(i => {
          prediction.push(i.prediction);
          confidence.push(i.confidence);
    })
    console.log(prediction)      
    console.log(confidence)
    for(let j=0; j <prediction.length; j++){
      if(prediction[j]==1){
        result += confidence[j];
        fakeReview += 1;
      }
    }
    var percentFakeReview = ((fakeReview)/(prediction.length))*100;
    var averageConfidence = result/fakeReview;
    console.log(result, fakeReview, percentFakeReview, averageConfidence);
    var jsondata = {"percentFakeReview" : percentFakeReview, "averageConfidence" : averageConfidence};
    console.log(jsondata);      
}
    
});



