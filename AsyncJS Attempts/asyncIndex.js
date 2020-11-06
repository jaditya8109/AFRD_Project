const cheerio = require('cheerio');
const request = require('request');
var express = require('express'); 
const axios = require('axios');
var parse = require('csv-parse');
const fs = require('fs');
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



var result = 0;
fakeReview = 0;
var percentFakeReview;
var averageConfidence;

function scrapping(productURL){
    const dataa = [];
    return new Promise((resolve) => {
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
            resolve(dataa);
        })
        
    }) 
    

};

const mlOutput = async (arey)=>{
    // console.log(arey);
    const temp = arey.map(elem => {
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
    const dataa = await scrapping(productURL);
    const [prediction, confidence] = await mlOutput(dataa);
    console.log(prediction, confidence);
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
      return jsondata;
      console.log(jsondata);
};

// getoutput('https://www.amazon.in/Redmi-8A-Dual-Blue-Storage/dp/B07X4R63DF/ref=psdc_1805560031_t1_B01MEGHPZ4');

//routes

app.get("/result", (req,res)=>{
    res.render("result", {"percentFakeReview" : percentFakeReview, "averageConfidence" : averageConfidence});
  });
  
  app.get("/", (req,res)=>{
    res.render('collectURL');
  });
  
  app.post('/', async(req, res)=> {
    // res.send('You sent the URL ' + " =" + req.body.link );
    console.log(req.body.link);
    let data = await getoutput(req.body.link);
    console.log(data);
    res.send(data);
  });
  
  app.use((err,req,res,next)=>{
    res.send(err);
})

  app.listen(7000,()=>{
    console.log("listening to port 7000");
  })