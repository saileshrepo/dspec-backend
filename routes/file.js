var express = require('express');
var router = express.Router();
const FileServices = require('../services/file')
let networkDrive = require('windows-network-drive');
const configData = require('../config');
const networkDrivePathOut = configData.networkDrivePathOut;

router.post('/upload', function (req, res, next) {
    FileServices.fileUpload(req)
    .then(data => res.status(200).json(data))
    .catch(err => {
        console.log('github search error',err)
        res.status(400).json(err)
    })
});

router.get('/download/:filename', function (req, res) {
    console.log('File Download from network drive for ', req.params.filename)
    networkDrive.pathToWindowsPath(networkDrivePathOut)
        .then(function (windowsPath) {
            var filePath = windowsPath + '\\' + req.params.filename;
            console.log('file downloading path ', filePath);
            res.download(filePath);
        });
});

module.exports = router;