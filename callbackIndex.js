const cheerio = require('cheerio');
const request = require('request');
var express = require('express');  

const axios = require('axios');
var parse = require('csv-parse');
const fs = require('fs');
const { resolve } = require('path');
var express = require('express'); 
var bodyParser = require('body-parser');
var app     = express(); 
//ejs
app.set('view engine' , 'ejs');
//body-parser
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//paste ur URL below
// const productURL = 'https://www.amazon.in/Redmi-8A-Dual-Blue-Storage/dp/B07X4R63DF/ref=psdc_1805560031_t1_B01MEGHPZ4'
//To save in csv
const writeStream = fs.createWriteStream('data.csv');

var dataa = [];
var prediction = [];
var confidence = [];


function scrapping(productURL, callback){
    
        //paste ur URL below
        // const productURL = 'https://www.amazon.in/Redmi-8A-Dual-Blue-Storage/dp/B07X4R63DF/ref=psdc_1805560031_t1_B01MEGHPZ4'
    request(productURL, (error, response, html) => {
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
                dataa.push(`${textReview}`);
                // return dataa;
            });
            console.log(dataa);
            console.log('data saved!');
            callback(dataa);
        }
        
    });
}

function mlOutput(arey){
    console.log('arey');
    return new Promise(()=>{
      for(var i = 0; i<arey.length; i++){
        // calling model api using axios
        axios.get('https://afrd.herokuapp.com/', {
            params: {
            query: arey[i]
            }
        }).then ((data)=> {
        console.log(data.data)
        prediction.push(data.data.prediction);
        confidence.push(data.data.confidence);
        
        resolve([prediction,confidence]);
         })
         .catch((error)=> console.log(error))
      }
      
      
    }).then(()=>{
      console.log("inside")
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
      }).catch((error)=>console.log(error));
        

};




//routes

app.get("/result", (req,res)=>{
    res.render("result", {"percentFakeReview" : percentFakeReview, "averageConfidence" : averageConfidence});
  });
  
  app.get("/", (req,res)=>{
    res.render('collectURL');
  });
  
  app.post('/', (req, res)=> {
    res.send('You sent the URL ' + " =" + req.body.link );
    scrapping(req.body.link, mlOutput);
    console.log(req.body);
  });
  
  app.listen(7000,()=>{
    console.log("listening to port 7000");
  })

