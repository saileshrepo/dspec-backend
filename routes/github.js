const express = require('express');
const router = express.Router();
const GithubServices = require('../services/github');

router.get('/search/:track/:ERP/:keyword',async function (req, res) {
    var erp = req.params.ERP;
    var track = req.params.track;
    var key = req.params.keyword;

    GithubServices.githubFileSearch(key,erp,track)
    .then(data => res.json(data))
    .catch(err => {
        console.log('github search error',err)
        res.status(400).json(err)
    })    
});

router.get("/uipathtrigger/:branch/:aobjective/:amodule/:report/:executiontype/:recurrence/:emailid", function (req, res) {
    var branch = req.params.branch;
    var aobjective = req.params.aobjective;
    var amodule = req.params.amodule;
    var report = req.params.report;
    var executiontype = req.params.executiontype;
    var recurrence = req.params.recurrence;
    var emailid = req.params.emailid;

    GithubServices.triggerUiPath(branch,aobjective,amodule,report,executiontype,recurrence,emailid)
    .then(data => res.json(data))
    .catch(err => {
        console.log('github search error',err)
        res.status(400).json(err)
    })
})

module.exports = router;