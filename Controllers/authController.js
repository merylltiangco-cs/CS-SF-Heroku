const request = require('request-promise');
const baseUrl = "https://contentserv01-tech-prtnr-eu03-dw.demandware.net";
const grantService = "/dw/oauth2/access_token?client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&grant_type=urn:demandware:params:oauth:grant-type:client-id:dwsid:dwsecuretoken";
const clientSecret = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const password = "CSsandbox#2019";
const userName = "admin";
const restEndpoint = "/s/-/dw/data";
const apiVersion = "/v17_4";
const requestUrl = baseUrl + restEndpoint + apiVersion;

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
        'Authorization': 'Bearer ' + accesToken.access_token
      };

      request.get(requestUrl + '/products/sony-kdl-26n4000?expand=all&site_id=SiteGenesis', { headers: requestHeader })
        .then((response) => {
          res.status(200).end(response);

        }).catch((error) => {

          res.status(error.statusCode).send(error.error.error_description);

        });
    }).catch((error) => {
      res.status(error.statusCode).send(error.error.error_description);
    });

}

module.exports = auth;