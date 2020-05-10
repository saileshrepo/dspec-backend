const client_id = "14c4d03cf78dca83133e"
const request = require('request');

var methods = {}
var methods = {
    gettoken: function (callback) {
        var options = {
            'method': 'POST',
            'url': 'https://account.uipath.com/oauth/token',
            'headers': {
                'Content-Type': ['application/json', 'text/plain'],
                'X-UIPATH-TenantName': 'DeloitteDefivu0362380'
            },
            body: "{\r\n    \"grant_type\": \"refresh_token\",\r\n    \"client_id\": \"8DEv1AMNXczW3y4U15LL3jYf62jK93n5\",\r\n    \"refresh_token\": \"koW7HuJ0WBK5h4fPGw9epFwXYAZ2BWCrn3DhMfT88zRa5\"\r\n}"
        };
        request(options, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                try {
                    console.log("Failed to authenticate ", response.statusCode);
                } catch (e) {
                }
                console.log(error);
            }
            else {
                console.log("token generated")

                callback(JSON.parse(response.body));
            }
        });

    }
};
exports.data = methods;