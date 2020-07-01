const express = require('express');
const router = express.Router();
const request = require('request');

const csv = require('csvtojson');
const token_generation = require('./generate_token');

router.get('/search/:track/:ERP/:keyword', function (req, res) {

    var key = req.params.keyword
    var owner = "sailesharya";
    var repo = "dspec-repo";
    var erp = req.params.ERP;
    var track = req.params.track;
    var refFile = "DSPEC_Report_Keywords2.csv";
    var accessToken = "beb5181984dddb74623c50dba0f2ee46e70757c6"; // Corresponds to "DSPEC-ReadCSV-Node" of Personal(44e69) Access Tokens

    // Capture the response in RAW form
    var options = {
        method: "GET",
        url: `https://api.github.com/repos/${owner.toLowerCase()}/${repo.toLowerCase()}/contents/${refFile}?access_token=${accessToken}&ref=master`,
        headers: {
            'Accept': 'application/vnd.github.v3.raw',
            'User-Agent': 'request'
        }
    };

    request(options, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            try {
                console.log("Failed to get repo ", response.statusCode);
            } catch (e) {
                // TODO
            }
            console.log(error);
        } else {
            // Repo Accessed !
            console.log('Accessed repo');
            var csvData = response.body;
            csv()
                .fromString(csvData)
                .then((jsonObj) => {
                    console.log(jsonObj)
                    //     //   Business Logic
                    result = []
                    jsonObj.forEach(function (arrayItem) {

                        if (arrayItem.Track == track && arrayItem.Keywords.includes(key) && arrayItem.ERP == erp) {
                            //var obj = {"ObjectName":arrayItem.ObjectName,"Track":arrayItem.Track,"ERP":arrayItem.ERP,"Description":arrayItem.Description}
                            result.push(arrayItem)
                        }
                    });

                    if (result.length == 0) {
                        res.send("Not Matches Found with this keyword: " + key)
                    }
                    else {
                        res.send(result)
                    }
                    //ends here

                });
            //console.log('JSON Object : \n ' + jsonObj);
        }
    })
});



//-----------------------------------------------------------------------------
router.get("/uipath", function (req, res) {

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
router.get("/uipathtrigger/:branch/:aobjective/:amodule/:report/:executiontype/:recurrence/:emailid", function (req, res) {
    //var a=""
    token_generation.data.gettoken(function (token) {
        a = token.access_token
        console.log(a)
        var branch = req.params.branch;
        var aobjective = req.params.aobjective;
        var amodule = req.params.amodule;
        var report = req.params.report;
        var executiontype = req.params.executiontype;
        var recurrence = req.params.recurrence;
        var emailid = req.params.emailid;
        var option = {
            'method': 'POST',
            'url': 'https://platform.uipath.com/deloivpofuxp/DeloitteDefseh4311233/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs',
            'headers': {
                'Content-Type': 'application/json',
                'X-UIPATH-TenantName': 'DeloitteDefseh4311233',
                'Authorization': 'Bearer ' + a
            },
            //body:  JSON.stringify({"startInfo":{"ReleaseKey":"d11120f2-ef3d-4bbc-b53f-01f6cf55a5b3","Strategy":"Specific","RobotIds":[74903],"NoOfRobots":0,"Source":"Manual","InputArguments":"{\"ReportPath\":\"CloudERP/OTC/Reports/OES_CLOUD_REP_AR Invoice_Print_Report_V2.zip\",\"EmailId\":" + $emailid + ",\"Branch\":" + $branch + ",\"aObjective\":" + $aobjective + ",\"aModule\":" + $amodule + ",\"Report\":" + $report + ",\"ExecutionType\":" + $executiontype + ",\"Recurrence\":" + $recurrence + " ,\"RequestId\":\"Request Number from UI\",\"InputFilePath\":\"Full file path with the name of input file placed in File Share Location\"}"}})
            body: {
                "startInfo":
                {
                    "ReleaseKey": "d11120f2-ef3d-4bbc-b53f-01f6cf55a5b3",
                    "Strategy": "Specific",
                    "RobotIds": [74903],
                    "NoOfRobots": 0,
                    "Source": "Manual",
                    "InputArguments":
                    {
                        "ReportPath": "CloudERP/OTC/Reports/OES_CLOUD_REP_AR Invoice_Print_Report_V2.zip",
                        "EmailId": emailid,
                        "Branch": branch,
                        "aObjective": aobjective,
                        "aModule": amodule,
                        "Report": report,
                        "ExecutionType": executiontype,
                        "Recurrence": recurrence,
                        "RequestId": "Request Number from UI",
                        "InputFilePath": "Full file path with the name of input file placed in File Share Location"
                    }
                }
            }
        };
        console.log(option);

        request(option, function (error, response, body) {
            if (error || response.statusCode !== 201) {
                try {

                    console.log("Failed to authenticate ", response.statusCode);
                } catch (e) {
                    // TODO
                }
                console.log(error);
                console.log(response);


            }
            else {
                console.log(response)
            }
        });

    });
});

module.exports = router;