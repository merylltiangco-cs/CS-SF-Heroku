const request = require('request-promise');
const baseUrl = process.env.BASE_URL;
const grantService = process.env.GRANT_SERVICE;
const clientSecret = process.env.CLIENT_SECRET;
const password = process.env.PASSWORD;
const userName = process.env.USERNAME;
const dataEndpoint = process.env.DATA_ENDPOINT;
const apiVersion = process.env.API_VERSION;
const requestUrl = baseUrl + dataEndpoint + apiVersion;

function auth(req, res) {
  const loginURL = baseUrl + grantService;
  const credString = new Buffer(userName + ':' + password + ':' + clientSecret);
  const encoded = credString.toString('base64');

  const headers = {
    'Authorization': 'Basic ' + encoded,
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  request.post(loginURL, { headers: headers })
    .then((tokenResponse) => {
      const accesToken = JSON.parse(tokenResponse);
      const requestHeader = {
        'Authorization': 'Bearer ' + accesToken.access_token,
        'Content-Type': 'application/json'
      };
      const data = {
        'query': {
          'match_all_query': {}
        },
        'select': '(**)'
      };
      //  /products/sony-kdl-26n4000?expand=all&site_id=SiteGenesis
      request.post(requestUrl + '/product_search', { headers: requestHeader, json: data })
        .then((response) => {
          res.status(200).end(response);

        }).catch((error) => {

          res.status(error.statusCode).send(error);

        });
    }).catch((error) => {
      res.status(error.statusCode).send(error.error.error_description);
    });

}

module.exports = auth;