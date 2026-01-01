const jsonfile = require("jsonfile");
const moment = require("moment");
const simpleGit = require("simple-git");

const FILE_PATH = "./data.json";
const git = simpleGit();

const START_DATE = "2026-01-01";
const END_DATE = "2026-03-18";
const COMMITS_PER_DAY = 20;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function makeCommits() {
  let date = moment(START_DATE);

  while (date.isSameOrBefore(END_DATE)) {
    console.log(`\nProcessing ${date.format("YYYY-MM-DD")}`);

    for (let i = 0; i < COMMITS_PER_DAY; i++) {
      const commitDate = date
        .clone()
        .hour(12)
        .minute(i)
        .second(Math.floor(Math.random() * 60));

      const formattedDate = commitDate.format("YYYY-MM-DDTHH:mm:ss");

      const data = {
        date: formattedDate,
        commit: i + 1,
      };

      try {
        await jsonfile.writeFile(FILE_PATH, data, { spaces: 2 });

        await git.add([FILE_PATH]);

        await git.commit(
          `Commit ${i + 1} on ${date.format("YYYY-MM-DD")}`,
          undefined,
          {
            "--date": formattedDate,
          },
        );

        console.log(`Commit ${i + 1} done`);
      } catch (err) {
        console.error("Commit failed:", err);
        return;
      }

      await sleep(50);
    }

    date.add(1, "days");
  }

  try {
    await git.push();
    console.log("\n✅ All commits completed and pushed.");
  } catch (err) {
    console.error("Push failed:", err);
  }
}

makeCommits();
