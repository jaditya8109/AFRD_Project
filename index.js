const cheerio = require('cheerio');
const request = require('request');
var express = require('express'); 
const axios = require('axios');
var parse = require('csv-parse');
const fs = require('fs');
var bodyParser = require('body-parser');
const { resolve } = require('path');
var app     = express(); 
axios.defaults.baseURL = 'https://afrd.herokuapp.com/';
axios.default.timeout=8000;
app.set('view engine' , 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

const writeStream = fs.createWriteStream('data.csv');

async function scrapping(productURL){
    const dataa = [];
    let response =  await new Promise((resolve) => {
      axios.get(productURL)
      .then((response) => {
        const $ = cheerio.load(response.data);
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
            // console.log(dataa);
            // console.log('data saved!');
            resolve(dataa)
              
      }).catch(function (err) {
        console.log(err);
    })
 })
    
     return response
    };




async function mlOutput(arrayData){
    // console.log(arrayData)
    let requests=(arrayData).map((data)=>{
        return (axios.get('/',{params:{query:data}}).then((data)=>{
            return data
        }).catch((err)=>{
          return err
        }))
    })
   
    let response= await (Promise.all(requests))
    console.log(response[0])
    const prediction = [];
    const confidence = [];
    response.forEach(val => {
        console.log(val.data)
        prediction.push(val.data.prediction);
        confidence.push(val.data.confidence);
    })
    // console.log(response[0])
    return [prediction,confidence];

};

async function getoutput(productURL){
    console.log("prod url "+productURL)
    let result = 0;
    let fakeReview = 0;
    try{
      let dataa = await scrapping(productURL);
      // console.log(dataa)
     
      const [prediction, confidence] = await mlOutput(dataa);
    console.log("prediction :"+prediction+"conf "+confidence);
    for(let j=0; j <prediction.length; j++){
        if(prediction[j]==1){
          result += confidence[j];
          fakeReview += 1;
        }
      }
      percentFakeReview = ((fakeReview)/(prediction.length))*100;
      averageConfidence = result/fakeReview;
      // console.log(result, fakeReview, percentFakeReview, averageConfidence);
      let jsondata = {"percentFakeReview" : percentFakeReview, "averageConfidence" : averageConfidence};
      // console.log(jsondata);
      return jsondata;
    
    }catch(err){
      throw err;
    }
      
};

//routes  
app.get("/", (req,res)=>{
  res.render('collectURL');
});
  
app.post("/result", async(req, res,next)=> {
     getoutput(req.body.link).then((data)=>{
       res.send(data)
     }).catch((err)=>{
       console.log(err)
       next(err)
     })
   
});
  
app.use((err,req,res,next)=>{

  res.send(err);
})

let port = process.env.PORT || 3000
let server=app.listen(port, ()=>{
  console.log("listening to port 3000");
})
// server.timeout=1000;