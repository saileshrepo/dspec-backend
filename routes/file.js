const express = require('express');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const mv = require('mv');
const path = require('path');
const networkDrive = require('windows-network-drive');
const ExcelJS = require('exceljs');
const dateFormat = require('dateformat');

var store = multer.diskStorage({
  destination: function (req, file, callback) {
    console.log('destination');
    console.log(file);
    let uploadPath = path.join(__dirname, '../uploads');
    console.log("upload path for " + file.originalname, uploadPath)
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
          var uploadpath = windowsPath + '\\' + newFileName;
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
              return res.status(200).json({
                originalName: req.file.originalname
                , uploadname: req.file.filename
                , newFileName: newFileName
                , uploadPath: uploadpath
              });
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
      var filePath = windowsPath + '\\' + fileToDeleteName;
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

router.post('/export', (req, res) => {
  let user = req.body.user;
  let data = req.body.data;

  console.log('Exporting data for ' + user);

  exportRiceTrackerData(user, data)
    .then(exportResponse => {
      console.log("File exported", exportResponse);
      let exportedFilename = exportResponse.fileName;
      let exportedFilePath = exportResponse.filePath;

      res.sendFile(exportedFilePath, (err) => {
        if (err) console.log(err);
        fs.unlinkSync(exportedFilePath);
      });

    }).catch(error => {

      res.status(422).json({
        error,
        message: "Something went wrong"
      });

    });
});

async function exportRiceTrackerData(user, data) {

  console.log("Expoting ", data);

  let finalUser = user || 'nil';
  let finalData = data || [];

  const riceTrackerWorkbook = new ExcelJS.Workbook();
  const riceTrackerWorksheet = riceTrackerWorkbook.addWorksheet("Rice Trackers");

  riceTrackerWorksheet.columns = [
    { header: 'RICE ID', key: 'rice_id', width: 7, style: { font: { 'name': 'Calibri', 'family': 2 } } },
    { header: 'Object Name', key: 'object_name', width: 40, style: { font: { 'name': 'Calibri', 'family': 2 } } },
    { header: 'Object Type', key: 'object_type', width: 15, style: { font: { 'name': 'Calibri', 'family': 2 } } },
    { header: 'Object Description', key: 'object_desc', width: 35, style: { font: { 'name': 'Calibri', 'family': 2 } } },
    { header: 'Industry', key: 'industry', width: 8, style: { font: { 'name': 'Calibri', 'family': 2 } } },
    { header: 'Module', key: 'module', width: 8, style: { font: { 'name': 'Calibri', 'family': 2 } } },
    { header: 'Track', key: 'track', width: 8, style: { font: { 'name': 'Calibri', 'family': 2 } } },
    { header: 'Status', key: 'status', width: 8, style: { font: { 'name': 'Calibri', 'family': 2 } } },
    { header: 'Github Path', key: 'github_path', width: 150, style: { font: { 'name': 'Calibri', 'family': 2 } } },
  ];

  let riceTrackerFileName;

  for (let i = 0; i < finalData.length; i++) {
    riceTrackerWorksheet.addRow(finalData[i]);
    riceTrackerFileName = finalData[i].rice_tracker_file_name;
  }

  riceTrackerWorksheet.eachRow( (row, rowNumber) => {
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      // console.log('Cell ' + colNumber + ' = ' + cell.value);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.font = {
        name: 'Calibri',
        family: 4,
        size: 10
      };
    });
  });

  const headerRow = riceTrackerWorksheet.getRow(1);
  headerRow.font = {
    bold: true
  };

  let exportDate = new Date();
  let formattedDate = dateFormat(exportDate, "dd-mm-yyyy-HH-MM");
  let fileName = formattedDate + '_' + finalUser + '.xlsx';

  let exportPath = path.join(__dirname, '../excel-exports/' + fileName);
  console.log(exportPath);

  await riceTrackerWorkbook.xlsx.writeFile(exportPath);
  return {
    fileName: fileName,
    filePath: exportPath
  }
}

module.exports = router;