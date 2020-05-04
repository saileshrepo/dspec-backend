const express = require('express');
const router = express.Router();
const request = require('request');

const csv = require('csvtojson');
const token_generation = require('./generate_token');

router.get('/search/:branch/:keyword', function(req, res){
var key =req.params.keyword
var owner = "sailesharya";
var repo = "dspec-repo";
var branch = req.params.branch;
var refFile = "DSPEC_Report_Keywords.csv";
var accessToken = "beb5181984dddb74623c50dba0f2ee46e70757c6"; // Corresponds to "DSPEC-ReadCSV-Node" of Personal(44e69) Access Tokens

// Capture the response in RAW form
var options = {
    method: "GET",
    url: `https://api.github.com/repos/${owner.toLowerCase()}/${repo.toLowerCase()}/contents/${refFile}?access_token=${accessToken}&&ref=${branch}`,
    headers: {
       'Accept': 'application/vnd.github.v3.raw',
       'User-Agent': 'request'
    }
};

request(options, function(error, response, body) {
    if (error || response.statusCode !== 200) {
        try {
            console.log("Failed to get repo ", response.statusCode);
        } catch (e) {
            // TODO
        }
        console.log(error);
    } else {
        // Repo Accessed !
        console.log ('Accessed repo');
        var csvData = response.body;
        csv()
       .fromString(csvData)
       .then((jsonObj)=>{
          // Business Logic
    result=[]    
    jsonObj.forEach(function (arrayItem) {
      
            if(arrayItem.Keywords.includes(key))
            {
                var obj = {"Report_Name":arrayItem.ReportName}
                result.push(obj)
            }
        });

        if(result.length==0){
            res.send("Not Matches Found with this keyword: "+key)
        }
        else{
            res.send(result)
        }
      //ends here
               
           });
          //console.log('JSON Object : \n ' + jsonObj);
    }
})
});


//-----------------------------------------------------------------------------
router.get("/uipath",function(req,res){

    // var options = {
    //     'method': 'POST',
    //     'url': 'https://account.uipath.com/oauth/token',
    //     'headers': {
    //       'Content-Type': ['application/json', 'text/plain'],
    //       'X-UIPATH-TenantName': 'DeloitteDefivu0362380'
    //     },
    //     body: "{\r\n    \"grant_type\": \"refresh_token\",\r\n    \"client_id\": \"8DEv1AMNXczW3y4U15LL3jYf62jK93n5\",\r\n    \"refresh_token\": \"koW7HuJ0WBK5h4fPGw9epFwXYAZ2BWCrn3DhMfT88zRa5\"\r\n}"
      
        
    // };




// router.get("/uipath",function(req,res){

//     var option = {
//         method: "POST",
//         url: `https://usazuconde00173.us.deloitte.com/api/account/authenticate`,
//         headers : {'Content-Type' : 'application/json'},
//         form:{
//         tenancyName: "DFTEQA",
//         usernameOrEmailAddress: "POC_SYS_USER_IMPL",
//         password: "Deloitte123"
//         }
//     };


    // request(options, function(error, response, body) {
    //     if (error || response.statusCode !== 200) {
    //         try {
    //             console.log("Failed to authenticate ", response.statusCode);
    //         } catch (e) {
    //             // TODO
    //         }
    //         console.log(error);
    //     }
    //     else {
    //         console.log(response)
    //     }
    // });

})


//--------------------------------------------------------------------------------------------
router.get("/uipathtrigger",function(req,res){
    //var a=""
    token_generation.data.gettoken(function(token){
        a=token.access_token
        console.log(a)

        var option = {
            'method': 'POST',
            'url': 'https://platform.uipath.com/deloibhqbxjd/DeloitteDefault/odata/Jobs/UiPath.Server.Configuration.OData.StartJob',
            'headers': {
             // 'Content-Type': ['application/json', 'text/plain'],
              'X-UIPATH-TenantName': 'DeloitteDefivu0362380',
              'Authorization' : 'Bearer '+a
            },
            body: "{\"startInfo\":{\"ReleaseKey\":\"1fc72f99-51a2-4b20-9863-05111d16e2a8\",\"Strategy\":\"Specific\",\"RobotIds\":[85114],\"JobsCount\":0,\"Source\":\"Manual\"}}" 
            
            
        };
    
    
        request(option, function(error, response, body) {
            if (error || response.statusCode !== 200) {
                try {
                    console.log("Failed to authenticate ", response.statusCode);
                } catch (e) {
                    // TODO
                }
                console.log(error);
            }
            else {
                console.log(response)
            }
        });
        
    })
    

  

    

})

module.exports = router;