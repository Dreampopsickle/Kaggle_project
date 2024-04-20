//Install Dependencies
const { exec } = require("child_process");
const fs = require("fs");
const csv = require("csv-parser");
const moment = require("moment");
const _ = require("lodash");
const jsonfile = require("jsonfile");
/*----------------------------------------*/

//To download kaggle data set

const dlKaggleData = () => {
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
};

// dlKaggleData();
//----------------------------------//

// reads the CSV data and logs some initial stats or issues,
// like missing data or incorrect formats
const tikTokCSV = "./data/tiktok_dataset.csv";
const results = [];

const readData = () => {
  fs.createReadStream(tikTokCSV)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      console.log(results.slice(0, 5)); // Dispaly the first 5 rows
      console.log("Total rows read:", results.length);
    });
};

// readData();

///Data Cleaning
const cleanedData = [];

const dataClean = () => {
  fs.createReadStream(tikTokCSV)
    .pipe(csv())
    .on("data", (row) => {
      try {
        // Safe parsing with error handling
        row.impressions = row.impressions ? parseInt(row.impressions, 10) : 0;
        row.clicks = row.clicks ? parseInt(row.clicks, 10) : 0;
        row.cost = row.cost ? parseFloat(row.cost) : 0.0;

        if (!_.isEmpty(row) && row.impressions >= 0 && row.cost >= 0) {
          cleanedData.push(row);
        }
      } catch (error) {
        console.error("Error processing row:", error);
      }

      // Convert date fields to a standard format
      if (row.date) {
        row.date = moment(row.date, "MM/DD/YYYY").format("YYYY-MM-DD");
      }
    })
    .on("end", () => {
      console.log(
        "Data cleaning complete. Number of valid entries:",
        cleanedData.length
      );
      // Save the cleaned data
      const file = "./data/cleaned_tiktok_data.json";
      jsonfile.writeFile(file, cleanedData, { spaces: 2 }, function (err) {
        if (err) console.error(err);
      });
    });
};

dataClean();
