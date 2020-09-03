var MSICreator = require("electron-wix-msi").MSICreator;
var fs = require('fs');
var path = require("path")

// Step 1: Instantiate the MSICreator
const msiCreator = new MSICreator({
  appDirectory: path.resolve(__dirname,"./dist_electron/win-unpacked"),
  description: 'MaxGrabb',
  exe: 'maxgrabb',
  name: 'MaxGrabb',
  manufacturer: 'WeGrabb Technologies',
  version: '1.1.3',
  outputDirectory: path.resolve(__dirname,"./dist_electron"),
  ui : {
      chooseDirectory : true
  }
});

// Step 2: Create a .wxs template file
const supportBinaries = msiCreator.create().then(()=>{
    msiCreator.compile()
});

