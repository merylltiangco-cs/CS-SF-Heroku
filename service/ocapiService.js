const request = require('request-promise');
const baseUrl = process.env.BASE_URL;
const grantService = process.env.GRANT_SERVICE;
const clientSecret = process.env.CLIENT_SECRET;
const password = process.env.PASSWORD;
const userName = process.env.USER;


exports.getToken = (req, res, next) => {
  if(!req.session.accessToken){
    const loginURL = baseUrl + grantService;
    const credString = Buffer.from(userName + ':' + password + ':' + clientSecret).toString('base64');
    const headers = {
      'Authorization': 'Basic ' + credString,
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    request.post(loginURL, { headers })
        .then((tokenResponse) => {
            const { access_token } = JSON.parse(tokenResponse);
            req.session.accessToken = access_token;
            console.log(`1. ACCESS TOKEN: ${req.session.accessToken}`)
            next();
        });
  }else{
    next();
  }
};

exports.getJWToken = (req, res, next) => {
  if(!req.session.accessToken){

    const loginURL = baseUrl + '/s/SiteGenesis/dw/shop/v19_3/customers/auth?client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const headers = {
      'Content-Type': 'application/json'
    };

    const json = {
      'type': 'guest'
    };
    console.log(loginURL);
    request.post(loginURL, { headers, json })
        .then((tokenResponse) => {
            const { access_token } = tokenResponse;
            req.session.accessToken = access_token;
            console.log(`1. ACCESS TOKEN: ${req.session.accessToken}`)
            next();
        });
  }else{
    next();
  }
};