const cheerio = require('cheerio');
const request = require('request');
var express = require('express'); 
const axios = require('axios');
// var parse = require('csv-parse');
const fs = require('fs');
const path = require("path");
var bodyParser = require('body-parser');
var app     = express(); 
//ejs
app.set('view engine' , 'ejs');
//body-parser
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());



// scrapping 
var dataa = [];
var prediction = [];
var confidence = [];
var result = 0;
var fakeReview = 0;
var percentFakeReview;
var averageConfidence;
//paste ur URL below

//To save in csv





//routes



app.get("/", (req,res)=>{
  res.render('collectURL');
});

app.post('/', (req, res)=> {
  console.log(req.body);
  const productURL = req.body.link;
  
  
  const writeStream = fs.createWriteStream('data.csv');
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
      }).catch((error)=>{
          console.log(error);
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
  res.send("hello");
});

app.get("/result", (req,res)=>{
  res.render("result", {"percentFakeReview" : percentFakeReview, "averageConfidence" : averageConfidence});
});

app.listen(7000,()=>{
  console.log("listening to port 7000");
})



