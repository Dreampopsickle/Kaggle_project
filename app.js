const { exec } = require("child_process");

exec(
  "kaggle datasets download -d yakhyojon/tiktok -p ./ --unzip",
  (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  }
);
