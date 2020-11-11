# Amazon Fake Review Detection

https://afrd-stc.herokuapp.com/

## About
Amazon Fake Review Detector is a natural language processing based application that helps user to find reliability of reviews on any particular amazon product by finding the genuine reviews from all the reviews. User can input URL of any product in url input section. All the reviews of that particular product are then scrapped by node js backend using request and cheerio libraries and save in a csv file. Machine learning model then detects all the fake reviews and mark them as 1. Generally reviews that have too many spelling or grammar mistakes or reviews that are very short or empty are considered fake by ml model. ML model then sends 0 or 1 corresponding to each review to node js and then backend calculates prediction percentage of fake reviews and also average confidence or surety of fakeness of review.

## Tech Stack Used
### ML model: 		
CNN, LSTM, Doc2Vec, TFDIF
### Backend:
NodeJS, Express


