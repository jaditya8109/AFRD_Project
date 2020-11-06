// let Posts =[{title: "Post One", bode:"This is post One"}, {title: "Post Two", bode:"This is post two"}];

// function createPost(post){
//     return new Promise((resolve,reject)=>{
//         setTimeout(() => {
//             Posts.push(post);
//         }, 3000);

//         const error = false;
//         if(!error){
//             resolve();
//         }else{
//             reject('error occured')
//         }
//     })
    
    
// };

// function getPost(){
//     let output = '';
//     Posts.forEach((post)=>{
//         output += post.title + " ";
        
//     })
//     console.log(output);
// };

// createPost({title: "Post Three", bode:"This is post Three"}).then(getPost);


function myDisplayer(some) {
    console.log("hi")
    console.log(some);
    console.log("hello")
  }
  
  function myCalculator(num1, num2, callback) {
    setTimeout(() => {
        let sum = num1 + num2;
        console.log("sum")
        callback(sum);
    }, 3000);
    
  }
  
  myCalculator(5, 5, myDisplayer);