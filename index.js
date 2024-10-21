// require('dotenv').config();
const functions = require('@google-cloud/functions-framework');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});
const db = require('./models_index.js');

// host: "10.0.2.11",
// port: "3306",
// user: "webapp",
// password: "1ff5e2ef",
// database: "my-database-test",

const mailDomainName = process.env.MAIL_DOMAIN_NAME;
const webappDomainName = process.env.WEBAPP_DOMAIN_NAME;
const webappPort = process.env.WEBAPP_PORT;
const var_TOKEN_EXPIRY_TIME_MIN = process.env.TOKEN_EXPIRY_TIME_MIN;
const senderEmail = "no-reply" + "@" + mailDomainName;
const senderName = "Vishvesh Ashwinbhai Panchal";
const fromEmail = `CSYE6225 WebApp <${senderEmail}>`;
const subjectEmail = "CSYE6225 WebApp Email Verification";

const generateLinkViaUUID = async (uuid, email) => {
    
  // const verificationLink = "http://" 
  //                         + webappDomainName.toString() 
  //                         + ":" 
  //                         + webappPort.toString() 
  //                         + "/v1/user/verify?email=" 
  //                         + email.toString() 
  //                         + "&token=" + uuid.toString();

  const verificationLink = "https://" 
                          + webappDomainName.toString() 
                          // + ":" 
                          // + webappPortGlobal.toString() 
                          + "/v1/user/verify?email=" 
                          + email.toString() 
                          + "&token=" + uuid.toString();
  
  const returnTokenAndLinkObj = {
      "token": uuid,
      "verificationLink": verificationLink
  }
  return returnTokenAndLinkObj;
};

functions.cloudEvent('helloPubSub', async cloudEvent => {

  const base64name = cloudEvent.data.message.data;

  const dataReceived = base64name ? Buffer.from(base64name, 'base64').toString() : 'Error receiving data';
  const jsonObj = JSON.parse(dataReceived);
  const email = jsonObj.email;

  db.createDatabaseConnection().then(() => {
    console.log(`index.js: Connected to MySQL`);
  }).catch((error) => {
      console.log(`index.js: Error at createDatabaseIfNotPresent: ${error}`);
  });
  db.checkDatabaseConnection().then(() => {
    console.log(`index.js: checkDatabaseConnection successful`);
  }).catch((error) => {
      console.log(`index.js: Error at checkDatabaseConnection: ${error}`);
  });

  const fetchUser = await db.User.findOne({ where: 
    { username: email },
    attributes: ["id", "username", "first_name", "last_name"],
  });
  console.log(`fetchUser: ${fetchUser}`);
  console.log(`jsonObj: ${jsonObj}`);

  const tokenAndLinkObj = await generateLinkViaUUID(fetchUser.id, fetchUser.username);
  const token = tokenAndLinkObj.token;
  const verificationLink = tokenAndLinkObj.verificationLink;
  var date = new Date();
  var expiryTime = new Date(date.getTime() + (Number(var_TOKEN_EXPIRY_TIME_MIN)) * 60000);
  
  const updateUser = Object.assign({}, fetchUser);
  updateUser.token = token;
  updateUser.account_updated = new Date();
  updateUser.expiryTime = expiryTime;

  const responseVal = await db.User.update(updateUser, { where: { username: email } });
  console.log(`responseVal: ${responseVal}`);
  
  const htmlBody = `
      <p>Hello ${fetchUser.first_name} ${fetchUser.last_name},</p>
      <br>
      <p>Thank you for creating your account at CSYE 6225 WebApp!<p>
      <p>Please verify your account by clicking on the link here: <a href="${verificationLink}">${verificationLink}</a>.</p>
      <br>
      <p><br>Best regards,<br>${senderName}<br>Team, CSYE6225 WebApp</p>
    `;

  mg.messages.create(mailDomainName, {
    from: fromEmail,
    to: [email],
    subject: `${subjectEmail}`,
    // text: `Message: ${message}`,
    html: `${htmlBody}`,
  })
  .then(msg => console.log(msg))
  .catch(err => console.log(err));

//  db.closeDatabaseConnection().then(() => {
//    console.log(`index.js: closeDatabaseConnection successful`);
//  }).catch((error) => {
//      console.log(`index.js: Error at closeDatabaseConnection: ${error}`);
//  });

  console.log(`Verification link sent to user: ${email}`);
});





// // require('dotenv').config();
// const functions = require('@google-cloud/functions-framework');
// // const var_MAILGUN_API_KEY = "keyyyy";
// const formData = require('form-data');
// const Mailgun = require('mailgun.js');
// const mailgun = new Mailgun(formData);
// const mg = mailgun.client({username: 'api', key: 'keyyyyyyy'});
// // const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});


// const mysql = require('promise-mysql');

// const dbConfig = {
//   host: "10.0.2.11",
//   port: "3306",
//   user: "webapp",
//   password: "1ff5e2ef",
//   database: "my-database-test",
//   // ...config,
// };

// const createTcpPool = async (dbConfig) => {

//   return mysql.createPool(dbConfig);
// };

// async function testsqldb(dbConfig) { // Pass dbConfig as a parameter
//   try {
//     const pool = await createTcpPool(dbConfig);
//     console.log("Pool", pool);
//     const rows = await pool.query('SELECT * FROM Users');
//     console.log(rows);
//     pool.end();
//   } catch (error) {
//     console.error('Error1:', error);
//   }
// }

// functions.cloudEvent('helloPubSub', cloudEvent => {

//   const base64name = cloudEvent.data.message.data;

//   const dataReceived = base64name ? Buffer.from(base64name, 'base64').toString() : 'Error receiving data';
//   const jsonObj = JSON.parse(dataReceived);
//   const email = jsonObj.email;
//   const message = jsonObj.message;
//   const messageFooter = jsonObj.messageFooter;
//   const verificationLink = jsonObj.verificationLink;

//   mg.messages.create('omsolanki.me', {
//     from: "CSYE6225 webapp <no-reply@omsolanki.me>",
//     to: [email],
//     subject: "Webapp Verification Email ",
//     text: `Message: ${message}`,
//     html: `
//     <p>Message: ${message}</p>
//     <p><a href=${verificationLink}> ${verificationLink} </a></p>
//     <h4>${messageFooter}</h4>
//     `
//   })
//   .then(msg => console.log(msg))
//   .catch(err => console.log(err));

  
//   testsqldb({ 
//     host: "10.0.2.11",
//     port: "3306",
//     user: "webapp",
//     password: "1ff5e2ef",
//     database: "my-database-test",
//   }).then(msg => console.log("m1", msg))
//     .catch(err => console.log("e1", err));

//   console.log(`Verification link sent to user: ${email}`);

//   // // Working Function
//   // mg.messages.create('omsolanki.me', {
//   //   from: "CSYE6225 webapp <no-reply@omsolanki.me>",
//   //   to: ["sahama4106@mnsaf.com"],
//   //   subject: "Learn Mailgun API",
//   //   text: `Testing some Mailgun awesomeness! Message from PubSub: ${name}`,
//   //   html: `<h1>Testing some Mailgun awesomeness! Message from PubSub: ${name}</h1>`
//   // })
//   // .then(msg => console.log(msg)) // logs response data
//   // .catch(err => console.log(err)); // logs any error



//   // console.log(`Hello, ${name}!`);
//   // mg.messages.create('vishveshpanchal.me', {
//   //   from: "CSYE6225 webapp <no-reply@vishveshpanchal.me>",
//   //   to: ["mivevoc275@glaslack.com"],
//   //   subject: "Learn Mailgun API",
//   //   text: `Testing some Mailgun awesomeness! Message from PubSub: ${name}`,
//   //   html: `<h1>Testing some Mailgun awesomeness! Message from PubSub: ${name}</h1>`
//   // })
// });

