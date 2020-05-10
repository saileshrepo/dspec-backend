var express = require('express');
var router = express.Router();
const DbService = require('../services/db')

router.get('/getAssets', async function (req, res, next) {
    let assetId = req.params.id;
    let query = `select ASSET_ID,
    ASSET_NAME,
    ASSET_STATUS,
    DESCRIPTION
    FROM DFTE_DCODE_APPS.XXCOMN_DSPEC_ASSET_LIST`;
    const binds = {};

    if(assetId){
        binds.asset_id = assetId;
        query += `\nwhere ASSET_ID = :ASSET_ID`;
    }
    
    let result = await DbService.runSQL(query,binds)
    res.status(result.status).json(result.body);
});

router.get('/getPath', async function (req, res, next) {
    let userReqId = req.params.id;
    let query = `SELECT xdsa.generated_path
    ,xdal.asset_name
    ,xdsa.user_request_id
    ,decode(generated_path,'','In Progress','Completed') status
    ,SUBSTR(generated_path,INSTR(generated_path,'\\', -1, 1)+1, length(generated_path)) Filename
    FROM dfte_dcode_apps.xxcomn_dspec_suggested_asset xdsa,
    dfte_dcode_apps.xxcomn_dspec_asset_list xdal
    WHERE xdsa.asset_id=xdal.asset_id`;
    const binds = {};

    if(userReqId){
        binds.user_request_id = userReqId;
        query += `\nand USER_REQUEST_ID = :USER_REQUEST_ID`;
    }
    
    let result = await DbService.runSQL(query,binds)
    res.status(result.status).json(result.body);
});

router.post('/createRecord', async function (req, res, next) {
    const binds1 = {
        asset_name: req.body.ASSET_NAME,
        asset_status: req.body.ASSET_STATUS,
        description: req.body.DESCRIPTION,
        functional_track: req.body.FUNCTIONAL_TRACK,
        functional_area: req.body.FUNCTIONAL_AREA,
        erp_system: req.body.ERP_SYSTEM,
        project_name: req.body.PROJECT_NAME,
        entity_name: req.body.ENTITY_NAME
    }

    binds1.asset_id = {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER
    }

    let query1 =  `INSERT INTO DFTE_DCODE_APPS.XXCOMN_DSPEC_ASSET_LIST(
        ASSET_ID,
        ASSET_NAME,
        ASSET_STATUS,
        DESCRIPTION,
        FUNCTIONAL_TRACK,
        FUNCTIONAL_AREA,
        ERP_SYSTEM,
        PROJECT_NAME,
        ENTITY_NAME
        ) values(
        dfte_dcode_apps.xxcomn_dspec_asset_list_s.nextval,
        :asset_name,
        :asset_status,
        :description,
        :functional_track,
        :functional_area,
        :erp_system,
        :project_name,
        :entity_name)
        RETURNING ASSET_ID
        INTO :asset_id`;
    
    let result1 = await DbService.runSQL(query1,binds1)
    console.log('Response Q1: ',result1)

    let query2 =  `INSERT INTO dfte_dcode_apps.xxcomn_dspec_asset_attributes(
        ASSET_ID,
        KEY_WORDS
        ) values(
        :asset_id,
        :key_word)`;

    let binds2 = {
        asset_id : result1.asset_id,
        key_word: req.body.KEY_WORD
    }

    let result2 = await DbService.runSQL(query2,binds2)
    console.log('Response Q2: ',result2)

    let query3 =  `INSERT INTO dfte_dcode_apps.xxcomn_dspec_suggested_asset(
        ASSET_ID,
        USER_REQUEST_ID
        ) values(
        :asset_id,
        dfte_dcode_apps.xxcomn_dspec_user_request_s.nextval)
        RETURNING
        USER_REQUEST_ID
        INTO :user_request_id`;

    let binds3 = {
        asset_id : result1.asset_id
    }

    binds3.user_request_id = {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER
    }

    let result3 = await DbService.runSQL(query3,binds3)
    console.log('Response Q3: ',result3)

    res.status(result.status).json({asset_id:result1.asset_id,user_request_id:result3.user_request_id});
});

module.exports = router;