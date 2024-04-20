//Install Dependencies
const { exec } = require("child_process");
const fs = require("fs");
const csv = require("csv-parser");
const moment = require("moment");
const _ = require("lodash");
const jsonfile = require("jsonfile");
const file = "./data/cleaned_tiktok_data.json";
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
const displayColumnTitles = () => {
  const stream = fs
    .createReadStream(tikTokCSV)
    .pipe(csv())
    .on("headers", (headers) => {
      console.log("Column Titles:", headers);
    })
    .on("data", () => {
      stream.destroy();
    });
};

// readData();
// displayColumnTitles();

//*-----------------------------------------------------//

///Data Cleaning
const cleanedData = [];

const dataClean = () => {
  fs.createReadStream(tikTokCSV)
    .pipe(csv())
    .on("data", (row) => {
      try {
        // Clean numeric fields
        row.video_view_count = parseInt(row.video_view_count, 10) || 0;
        row.video_like_count = parseInt(row.video_like_count, 10) || 0;

        // Standardize boolean fields
        row.verified_status = row.verified_status === "true" ? true : false;
        row.author_ban_status = row.author_ban_status === "true" ? true : false;

        // Push cleaned row to new data array
        cleanedData.push(row);
      } catch (error) {
        console.error("Error processing row:", error);
      }
    })
    .on("end", () => {
      console.log(
        "Data cleaning complete. Number of valid entries:",
        cleanedData.length
      );
      // Save the cleaned data
      jsonfile.writeFile(file, cleanedData, { spaces: 2 }, function (err) {
        if (err) console.error(err);
        else console.log("Data cleaning complete.");
      });
    });
};

// dataClean();

//*-----------------------------------------------------*//
//Data Analysis

const analyzeTikTokData = () => {
  jsonfile.readFile(file, function (err, data) {
    if (err) {
      console.error(err);
    } else {
      analyzeViewsAndLikes(data);
      analyzeEngagement(data);
    }
  });
  // Calculate total views and average likes
  const analyzeViewsAndLikes = (data) => {
    const totalViews = data.reduce((acc, cur) => acc + cur.video_view_count, 0);
    const averageLikes =
      data.length > 0
        ? data.reduce((acc, cur) => acc + cur.video_like_count, 0) / data.length
        : 0;

    console.log(`Total Views: ${totalViews}`);
    console.log(`Average Likes per Video: ${averageLikes.toFixed(2)}`);
  };
  const analyzeEngagement = (data) => {
    const engagementScores = data.map((video) => {
      const views = parseInt(video.video_view_count, 10);
      if (views > 0) {
        // only calculate scores if there are views
        const likes = parseInt(video.video_like_count, 10) || 0;
        const shares = parseInt(video.video_share_count, 10) || 0;
        const comments = parseInt(video.video_comment_count, 10) || 0;
        return (likes + shares + comments) / views; // Normalize by views
      }

      return 0; // Return an engagement score of 0 if no views
    });

    const totalEngagementScore = engagementScores.reduce(
      (acc, cur) => acc + cur,
      0
    );
    const averageEngagementScore =
      engagementScores.length > 0
        ? totalEngagementScore / engagementScores.length
        : 0;

    console.log(
      `Average Engagement Score: ${averageEngagementScore.toFixed(4)}`
    );
  };
};

analyzeTikTokData();
