const express = require('express');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const mv = require('mv');
const path = require('path');
const networkDrive = require('windows-network-drive');
const configData = require('../config');
const networkDrivePathIn = configData.networkDrivePathIn;
const networkDrivePathOut = configData.networkDrivePathOut;

networkDrive.find(networkDrivePathIn)
    .then(function (result) {
        console.log('Network Drives :',result)
});

var store = multer.diskStorage({
    destination:function(req,file,callback){
        console.log('destination');
        console.log(file);
		callback(null, './uploads');
    },
    filename:function(req,file,callback){
        callback(null, Date.now()+'.'+file.originalname);
    }
});

var upload = multer({storage:store}).single('file');

router.post('/upload/:userRequestId', function(req,res,next){
    upload(req,res,function(err){
        if(err){
            return res.status(501).json({error:err});
        }
		let userRequestId = req.params.UserRequestId || 'New';
        if(req.file){
            var file = req.file,
                name = file.originalname,
                type = file.mimetype;
              
            networkDrive.pathToWindowsPath(networkDrivePathIn)
				.then(function (windowsPath) {
					var uploadpath = windowsPath + '\\' + userRequestId + '\\' + name;
					console.log(uploadpath);
					try {
						fs.mkdirSync(windowsPath + '\\' + userRequestId + '\\', { recursive: true })
					} catch (err) {
						if (err.code !== 'EEXIST') return res.status(501).json({error:err});
					}
					mv(file.path,uploadpath,function(err){
						if(err){
							console.log("File Upload Failed for ",uploadpath,err);
							return res.status(501).json({error:err});
						}else{
							console.log("File Uploaded Successfully to ",uploadpath);
							try{
								fs.unlinkSync(path.join(process.cwd(),'uploads',name))
							} catch(err) { 
								console.log('File Delete failed for', path.join(process.cwd(),'uploads',name) , err)
							}
							return res.status(200).json({originalname:req.file.originalname, uploadname:req.file.filename, uploadpath: uploadpath});
						}
					});
            });
       }        
    });
});

router.get('/download/:userRequestId/:filename', function (req, res) {
    console.log('File Download from network drive for ', req.params.filename)
    networkDrive.pathToWindowsPath(networkDrivePathOut)
        .then(function (windowsPath) {
            var filePath = windowsPath + '\\' + req.params.userRequestId + '\\' + req.params.filename;
            console.log('file downloading path ', filePath);
            res.download(filePath);
        });
});

router.get('/delete/:filename', function (req, res) {
	console.log('File Delete from network drive for ', req.params.filename )
    networkDrive.pathToWindowsPath(networkDrivePathIn)
        .then(function (windowsPath) {
            var filePath = windowsPath + '\\' + req.params.filename;
            try {
			  fs.unlinkSync(filePath)
			  console.log("Successfully deleted the file.")
			  res.status(200).json({filename:filePath})
			} catch(err) {
			  res.status(400).json(err)
			}
        });
});

module.exports = router;