const cheerio = require('cheerio');
const request = require('request');
var express = require('express');  
var app     = express(); 
const axios = require('axios');
var parse = require('csv-parse');
const fs = require('fs');
const path = require("path");
//ejs
app.set('view engine' , 'ejs');


// scrapping 

//paste ur URL below
const productURL = 'https://www.amazon.in/U-S-Polo-Assn-I638-978-PL_Blue-Melange_Large/dp/B0793LFJZP?pd_rd_w=JGKKj&pf_rd_p=278a95ed-d2b3-4cce-a02e-3075364244d4&pf_rd_r=N1MKV0R62JCJF39F08QC&pd_rd_r=3043a8ea-fe4d-4ead-a9bd-1e82d8ad1da3&pd_rd_wg=zfqkY'
//To save in csv

const writeStream = fs.createWriteStream('data.csv');

var dataa = [];
var prediction = [];
var confidence = [];
var result = 0;
fakeReview = 0;
var percentFakeReview;
var averageConfidence;
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
    percentFakeReview = ((fakeReview)/(prediction.length))*100;
    averageConfidence = result/fakeReview;
    console.log(result, fakeReview, percentFakeReview, averageConfidence);
    var jsondata = {"percentFakeReview" : percentFakeReview, "averageConfidence" : averageConfidence};
    console.log(jsondata);      
}   
});

//routes

app.get("/result", (req,res)=>{
  res.render("result", {"percentFakeReview" : percentFakeReview, "averageConfidence" : averageConfidence});
});

app.get("/", (req,res)=>{
  res.render('collectURL');
});

app.listen(6969,()=>{
  console.log("listening to port 6969");
})



