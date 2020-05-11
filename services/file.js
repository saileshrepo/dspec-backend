var multer = require('multer');
const mv = require('mv');
let networkDrive = require('windows-network-drive');
const networkDrivePathIn = "\\\\usazuconde00173\\DFTE\\R2\\DSPEC\\IN";
const networkDrivePathOut = "\\\\usazuconde00173\\DFTE\\R2\\DSPEC\\OUT";

networkDrive.find(networkDrivePathIn)
    .then(function (result) {
        console.log('Network Drives :',result)
        if(result.length === 0){
            process.exit(1)
        }
    });

var store = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.' + file.originalname);
    }
});

var upload = multer({ storage: store }).single('file');

exports.fileUpload = (req) => {
    return new Promise((resolve, reject) => {
        upload(req, res, function (err) {
            if (err) {
                reject({ status: 400, message: 'File Upload Failed', error: err })
            }
            if (req.file) {
                var file = req.file,
                    name = file.originalname,
                    type = file.mimetype;


                networkDrive.pathToWindowsPath(networkDrivePathIn)
                    .then(function (windowsPath) {
                        console.log('network upload status ', windowsPath);
                        var uploadpath = windowsPath + '\\' + name;
                        mv(file.path, uploadpath, function (err) {
                            if (err) {
                                console.log("File Upload Failed", name, err);
                                reject({ status: 400, message: 'File Upload Failed to Network Drive', error: err })
                            }
                            else {
                                console.log("File Uploaded", name);
                                resolve({
                                    status: 200, message: 'File Upload Success', name: name,
                                    originalname: req.file.originalname, uploadname: req.file.filename
                                })
                            }
                        });
                    });
            }
        });
    });
}