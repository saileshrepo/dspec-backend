const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('../config/config');
const axios = require('axios');

const uiPathAuthURL = config.uiPath.endpoints.authenticate;

const uiPathAssetsURL = config.uiPath.endpoints.getAssets;

const uiPathCredentialURL = config.uiPath.endpoints.getCredentials;

const uiPathFoldersURL = config.uiPath.endpoints.getFolderID;

// UIPath wrapper routes

router.post('/authenticate',(req, res) => {

    let uiPathAuthPayload = req.body;
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
            message: "Unauthorized",
            error: error.response.data
        });
    });
});

router.get('/assets', (req, res) => {

    let bearerAuthHeader = req.header("Authorization");
    let tenantName = req.header("X-UIPATH-TenantName");
    let organizationId = req.header("X-UIPATH-OrganizationUnitId");

    console.log("Bearer Authorization Header",bearerAuthHeader);
    console.log("Tenant Name Header", tenantName);
    console.log("Organization ID", organizationId);

    axios({
        method: 'get',
        url: uiPathAssetsURL,
        headers: {
            'Authorization':bearerAuthHeader,
            'X-UIPATH-TenantName':tenantName,
            'X-UIPATH-OrganizationUnitId':organizationId
        }
      }).then(response => {
          console.log("Fetched all assets");
          res.json(response.data);
      }).catch(error => {
        //   console.log(error);

          if(error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            // console.log(error.response.headers);

            res.status(501).json({
                message: "Could not fetch assets",
                error: error.response.data
            })
          } else {
            console.log(error);
            res.status(501).json({
                message: "Something went wrong"
            });
          }
      });
    
});

router.get('/credentials/:uiPathAssetName/:folderName/:tenancyName',(req,res) => {

    let uiPathAssetName = req.params.uiPathAssetName;
    let folderName = req.params.folderName;
    let tenancyName = req.params.tenancyName;

    let uiPathCredentialURLWithRoutes = uiPathCredentialURL
    + '/' + uiPathAssetName
    + '/' + folderName
    + '/' + tenancyName;

    console.log('GET '+uiPathCredentialURLWithRoutes);

    axios({
        method: 'get',
        url: uiPathCredentialURLWithRoutes
      }).then(response => {
          res.json(response.data);
      }).catch(error => {

          if(error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          }

          res.status(501).json({
              message: "Could not fetch credential details for Credential "+uiPathAssetName,
              error: error.response.data
          })
      });

});

router.get('/folders',(req,res) => {

    let bearerAuthHeader = req.header("Authorization");
    let tenantName = req.header("X-UIPATH-TenantName");
    let folderNameFilter = req.query['$filter'];

    axios({
        method: 'get',
        url: uiPathFoldersURL,
        headers: {
            'Authorization':bearerAuthHeader,
            'X-UIPATH-TenantName':tenantName
        },
        params: {
            '$filter':folderNameFilter
        }
    }).then(response => {

        console.log("/Folders/ response status", response.status);
        console.log("/Folders/ response data", response.data);

        res.json(response.data);
    }).catch(errorResponse => {
        if(errorResponse.response){
            console.log("/Folders/ error response status", errorResponse.response.status);
            console.log("/Folders/ error response data", errorResponse.response.data);

            res.status(errorResponse.response.status).json(errorResponse.response.data);
        } else {
            console.log(errorResponse);
            res.json({
                message: "Something went wrong"
            });
        }
    })

});

module.exports = router;