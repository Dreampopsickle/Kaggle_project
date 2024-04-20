//Install Dependencies
const { exec } = require("child_process");
const fs = require("fs");
const csv = require("csv-parser");
/*----------------------------------------*/

//To download kaggle data set
// exec(
//   "kaggle datasets download -d yakhyojon/tiktok -p ./ --unzip",
//   (error, stdout, stderr) => {
//     if (error) {
//       console.error(`exec error: ${error}`);
//       return;
//     }
//     console.log(`stdout: ${stdout}`);
//     console.error(`stderr: ${stderr}`);
//   }
// );

const results = [];

fs.createReadStream("./data/tiktok_dataset.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    console.log(results);
  });
