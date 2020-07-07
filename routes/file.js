const express = require('express');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const mv = require('mv');
const path = require('path');
const networkDrive = require('windows-network-drive');

var store = multer.diskStorage({
  destination: function (req, file, callback) {
    console.log('destination');
    console.log(file);
    let uploadPath = path.join(__dirname, '../uploads');
    console.log("upload path for "+file.originalname, uploadPath)
    callback(null, uploadPath);
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '.' + file.originalname);
  }
});

var upload = multer({ storage: store }).single('file');

router.post('/upload/:projectName/:userRequestId', function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      return res.status(501).json({ error: err });
    }
    let networkDriveRoot = req.query.networkDriveRoot;
    let networkDrivePathIn = req.query.networkDrivePathIn;

    let userRequestId = req.params.userRequestId || 'New';
    if (req.file) {
      var file = req.file,
        name = file.originalname,
        type = file.mimetype;
      var regex = new RegExp('[^.]+$');
      var fileExtension = name.match(regex);
      var filename = name.substr(0, name.lastIndexOf('.'));
      var newFileName = filename + '_' + req.params.userRequestId + '.' + fileExtension;
      var projectName = req.params.projectName;
      var networkDrivePath = networkDriveRoot + projectName + '\\' + networkDrivePathIn;

      // console.log("Project Name", projectName);
      // console.log("NetworkDriveIn", networkDrivePathIn);
      // console.log("New File Name", newFileName);
      // console.log("Network Drive Path", networkDrivePath);

      networkDrive.pathToWindowsPath(networkDrivePath)
        .then(function (windowsPath) {

          console.log("Network Windows Drive Path", windowsPath);
          var uploadpath = windowsPath + '\\' +  newFileName;
          uploadpath = uploadpath.trim();
          console.log("Upload path", uploadpath);
          try {
            fs.mkdirSync(windowsPath, { recursive: true })
          } catch (err) {
            if (err.code !== 'EEXIST') return res.status(501).json({ error: err });
          }
          mv(file.path, uploadpath, function (err) {
            if (err) {
              console.log("File Upload Failed for ", uploadpath, err);
              return res.status(501).json({ error: err });
            } else {
              console.log("File Uploaded Successfully to ", uploadpath);
              try {
                fs.unlinkSync(path.join(process.cwd(), 'uploads', name))
              } catch (err) {
                console.log('File Delete failed for', path.join(process.cwd(), 'uploads', name), err)
              }
              return res.status(200).json({ originalName: req.file.originalname
                , uploadname: req.file.filename
                , newFileName: newFileName
                , uploadPath: uploadpath });
            }
          });
        });
    }
  });
});

router.get('/download', function (req, res) {
  let downloadPath = req.query.generatedPath;
  networkDrive.pathToWindowsPath(downloadPath)
    .then(function (windowsPath) {
      console.log('File downloading path', windowsPath);
      res.download(windowsPath);
    });
});

router.delete('/delete/:projectName/:filename', function (req, res) {
  
  console.log('File Delete from network drive for ', req.params.filename);

  let networkDriveRoot = req.query.networkDriveRoot;
  let networkDrivePathIn = req.query.networkDrivePathIn;

  let fileToDeleteName = req.params.filename;
  
  var projectName = req.params.projectName;
  var networkDrivePath = networkDriveRoot + projectName + '\\' + networkDrivePathIn;

  networkDrive.pathToWindowsPath(networkDrivePath)
    .then(function (windowsPath) {
      var filePath = windowsPath + '\\' +  fileToDeleteName;
      console.log("FIle to delete", filePath);
      try {
        fs.unlinkSync(filePath)
        console.log("Successfully deleted the file.")
        res.status(200).json({ filename: filePath })
      } catch (err) {
        console.log(err);
        res.status(400).json(err)
      }
    });
});

module.exports = router;