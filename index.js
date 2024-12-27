const jsonfile = require('jsonfile');
const moment = require('moment');
const simpleGit = require('simple-git');
const FILE_PATH = "./data.json";

// Initialize simple-git instance
const git = simpleGit();

// Function to generate 100 random days in 2023
const getRandomDaysIn2023 = (numCommits) => {
    const days = [];
    let date = moment('2023-01-01'); // Start from January 1, 2023

    // Loop through the entire year of 2023
    while (date.year() === 2023) {
        days.push(date.format('YYYY-MM-DDTHH:mm:ssZ')); // Add the date in a GitHub-friendly format
        date.add(1, 'days');
    }

    // Randomly shuffle the days array to select random dates
    const randomDays = [];
    while (randomDays.length < numCommits) {
        const randomIndex = Math.floor(Math.random() * days.length);
        if (!randomDays.includes(days[randomIndex])) {
            randomDays.push(days[randomIndex]);
        }
    }

    return randomDays;
};

// Make commits on random days in 2023
const makeCommit = (n, days, commitsMade) => {
    if (commitsMade >= n) {
        git.push((err) => {
            if (err) {
                console.error("Error pushing changes:", err);
            } else {
                console.log("All commits are done and pushed.");
            }
        });
        return;
    }

    // Select a random day from the available list
    const randomDay = days[Math.floor(Math.random() * days.length)];

    // Create data to be written to the file (this will trigger a file change)
    const data = {
        date: randomDay,
        commit: commitsMade + 1
    };

    console.log(`Committing on random day: ${randomDay}`);

    // Write the data to the file (this ensures a change is made to trigger the commit)
    jsonfile.writeFile(FILE_PATH, data, { spaces: 2 }, (err) => {
        if (err) {
            console.error("Error writing to file:", err);
            return;
        }

        // Stage the file and commit it with the correct date format
        git.add([FILE_PATH])
            .commit(`Commit ${commitsMade + 1} on ${randomDay}`, { '--date': randomDay }, () => {
                console.log(`Committed on ${randomDay}`);
                
                // Increment commitsMade and remove the used day from the list
                const updatedDays = days.filter(day => day !== randomDay);
                makeCommit(n, updatedDays, commitsMade + 1); // Recursive call for next commit
            });
    });
};

// Get 100 random days in 2023
const randomDaysIn2023 = getRandomDaysIn2023(100);

// Start the process for 100 random commits in 2023
makeCommit(100, randomDaysIn2023, 0);
