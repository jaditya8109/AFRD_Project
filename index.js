const cheerio = require('cheerio');
const request = require('request');
var express = require('express'); 
const axios = require('axios');
var parse = require('csv-parse');
const fs = require('fs');
var bodyParser = require('body-parser');
var app     = express(); 

app.set('view engine' , 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

const writeStream = fs.createWriteStream('data.csv');

function scrapping(productURL){
    const dataa = [];
    return new Promise((resolve) => {
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
            // console.log(dataa);
            // console.log('data saved!');
            resolve(dataa);
        })
     }) 
 };

const mlOutput = async (arrayData)=>{
    const temp = arrayData.map(elem => {
        return axios.get('https://afrd.herokuapp.com/', {
            params: {
            query:elem
            }
        }).then ((resp)=> {
            return resp.data;
        }).catch((error)=>{return error});
    })

    const values = await Promise.all(temp)
    console.log(values)
    const prediction = [];
    const confidence = [];
    values.forEach(val => {
        prediction.push(val.prediction);
        confidence.push(val.confidence);
    })
    return [prediction, confidence];
};

async function getoutput(productURL){
    let result = 0;
    let fakeReview = 0;
    let percentFakeReview;
    let averageConfidence;
    const dataa = await scrapping(productURL);
    const [prediction, confidence] = await mlOutput(dataa);
    // console.log(prediction, confidence);
    for(let j=0; j <prediction.length; j++){
        if(prediction[j]==1){
          result += confidence[j];
          fakeReview += 1;
        }
      }
      percentFakeReview = ((fakeReview)/(prediction.length))*100;
      averageConfidence = result/fakeReview;
      console.log("sum of confidence ="+ result,"No of fake reviews ="+ fakeReview,"percentage of fake review ="+ percentFakeReview,"average confidence =" + averageConfidence);
      let jsondata = {"percentFakeReview" : percentFakeReview, "averageConfidence" : averageConfidence};
      return jsondata;
      // console.log(jsondata);
};

//routes  
app.get("/", (req,res)=>{
  res.render('collectURL');
});
  
app.post('/', async(req, res)=> {
  // console.log(req.body.link);
  try{

    let data = await getoutput(req.body.link);
    res.send(data);

  }catch(err){
    throw err;
  }
  
  // console.log(data);
  
});
  
app.use((err,req,res,next)=>{
  res.send(err);
})

let port = process.env.PORT || 7000;
app.listen(port, ()=>{
  console.log("listening to port 7000");
})