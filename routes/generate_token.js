const client_id="14c4d03cf78dca83133e"
const request = require('request');

var methods = {
	gettoken: function(callback) {
        var options = {
            method: "POST",
            url: `https://account.uipath.com/oauth/token`,
            headers : {'Content-Type' : 'application/json'},
            //cert:fs.readFileSync('usazuconde00173-us-deloitte-com.crt','utf8'),
            body : "{\"grant_type\":\"refresh_token\",\"client_id\":\"8DEv1AMNXczW3y4U15LL3jYf62jK93n5\",\"refresh_token\":\"uu8VC42d7fj23iN0t9AhgMyTdu_WmCZaRTJboIKCLCZMH\"}" 
            
        };
    
        request(options, function(error, response, body) {
            if (error || response.statusCode !== 200) {
                try {
                    console.log("Failed to authenticate ", response.statusCode);
                } catch (e) {
                    // TODO
                }
                console.log(error);
            }
            else {
                console.log("token generated,",response.body);
              
                callback(JSON.parse(response.body));
            }
            
        });
       
	}
};
exports.data = methods;