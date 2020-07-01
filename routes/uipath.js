const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('../config/config');
const axios = require('axios');

const uiPathAuthURL = config.uiPath.endpoints.authenticate;
const uiPathAuthPayload = config.uiPath.authPayload;

const uiPathAssetsURL = config.uiPath.endpoints.getAssets;

const uiPathCredentialURL = config.uiPath.endpoints.getCredentials;

// UIPath wrapper routes

router.post('/authenticate',(req, res) => {
    console.log("UIPath Authenticate invoked");
    console.log("UIPath Auth URL is",uiPathAuthURL);
    console.log("UIPath Auth Payload is", uiPathAuthPayload);

    axios({
        method: 'post',
        url: uiPathAuthURL,
        data: uiPathAuthPayload
      })
    .then(response => {
        console.log("Response is", response.data)
        res.status(200).json(response.data);
    }).catch(error => {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          }
        res.status(401).json({
            message: "Unauthorized"
        });
    });
});

router.get('/assets', (req, res) => {

    let bearerAuthHeader = req.header("Authorization");
    let tenantName = req.header("X-UIPATH-TenantName");

    console.log("Bearer Authorization Header",bearerAuthHeader);
    console.log("Tenant Name Header", tenantName);

    axios({
        method: 'get',
        url: uiPathAssetsURL,
        headers: {
            'Authorization':bearerAuthHeader,
            'X-UIPATH-TenantName':tenantName
        }
      }).then(response => {
          res.json(response.data);
      }).catch(error => {

          console.log(error);

          if(error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          }

          res.json({
              message: "Could not fetch assets"
          })
      });
    
});

router.get('/credentials/:uiPathAssetName/:folderName/:tenancyName',(req,res) => {

    let uiPathAssetName = req.params.uiPathAssetName;
    let folderName = req.params.folderName;
    let tenancyName = req.params.tenancyName;

    let uiPathCredentialURLWithRoutes = uiPathCredentialURL
    + '/' + uiPathAssetName
    + '/' + 'abc'
    + '/' + tenancyName;

    axios({
        method: 'get',
        url: uiPathCredentialURLWithRoutes
      }).then(response => {
          res.json(response.data);
      }).catch(error => {

          console.log(error);

          if(error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          }

          res.json({
              message: "Could not fetch credential details for Credential "+uiPathAssetName
          })
      });

});

module.exports = router;