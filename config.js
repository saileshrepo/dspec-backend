module.exports = {
    dbPool: {
        user: "DFTE_DSPEC_APPS",
        password: 'Dspec#123', 
        connectString: "150.136.240.142/dftedev_pdb1.dftepublicsubne.dftevcn.oraclevcn.com",
        poolMin: 32,
        poolMax: 32,
        poolIncrement: 0,
        poolTimeout:0
    },
	networkDrivePathIn : "\\\\usazuconde00173\\DFTE\\R2\\DSPEC\\IN",
    networkDrivePathOut : "\\\\usazuconde00173\\DFTE\\R2\\DSPEC\\OUT",
	repo : {
		owner : "sailesharya",
		repo : "dspec-repo",
		refFile : "DSPEC_Report_Keywords2.csv",
		accessToken : "beb5181984dddb74623c50dba0f2ee46e70757c6"		
	}
};
