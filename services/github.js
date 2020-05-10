const csv = require('csvtojson');
const token_generation = require('../services/generate_token');
const request = require('request');

exports.githubFileSearch = (key,erp,track) => {
    return new Promise((resolve, reject) => {
        var owner = "sailesharya";
        var repo = "dspec-repo";
        var refFile = "DSPEC_Report_Keywords2.csv";
        var accessToken = "beb5181984dddb74623c50dba0f2ee46e70757c6";

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
                console.log("Failed to get repo ", response.statusCode);
                reject({ status: 400, message: 'Failed to get the Github Repo', error: error })
            } else {
                console.log('Github Repo - Able to access');
                var csvData = response.body;
                csv()
                    .fromString(csvData)
                    .then((jsonObj) => {
                        console.log(jsonObj)
                        result = []
                        jsonObj.forEach(function (arrayItem) {
                            if (arrayItem.Track == track && arrayItem.Keywords.includes(key) && arrayItem.ERP == erp) {
                                result.push(arrayItem)
                            }
                        });

                        if (result.length == 0) {
                            resolve({ status: 210, message: "Not Matches Found with this keyword: " + key })
                        }
                        else {
                            resolve({ status: 200, result: result })
                        }
                    });
            }
        })
    })
}

exports.triggerUiPath = (branch,aobjective,amodule,report,executiontype,recurrence,emailid) => {
    return new Promise((resolve, reject) => {
        token_generation.data.gettoken(function (token) {
            a = token.access_token
            console.log('UiPath Token : ', token.access_token)
            var option = {
                'method': 'POST',
                'url': 'https://platform.uipath.com/deloivpofuxp/DeloitteDefseh4311233/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs',
                'headers': {
                    'Content-Type': 'application/json',
                    'X-UIPATH-TenantName': 'DeloitteDefseh4311233',
                    'Authorization': 'Bearer ' + a
                },
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
            console.log('option', option);

            request(option, function (error, response, body) {
                if (error || response.statusCode !== 201) {
                    reject({ status: 400, message: 'Failed to authenticate', error: error || response })
                }
                else {
                    resolve({ status: 200, result: response })
                }
            });
        })
    })
}