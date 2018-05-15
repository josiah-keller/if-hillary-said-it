const Twitter = require("twitter");
const { spawn } = require("child_process");
const fs = require("fs");
const twitterConfig = require("./config");

const CYCLE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MESSAGES = [
    "Imagine if President Hillary Clinton tweeted this =>",
    "How would you feel if Hillary Clinton were president and said something like this?",
    "Would you be outraged at Hillary Clinton saying this? Then why aren't you outraged at Donald Trump?",
    "What if Hillary Clinton made a comment like this as president?",
    "Donald Trump just said this.  What if it had been Hillary Clinton instead?",
    "Do you think Trump supporters would like this tweet if it was from Hillary Clinton?",
];

let cycleTimeout, twitter = new Twitter(twitterConfig);

let state = {
    lastTweetId: 1,
};

function loadState() {
    return new Promise((resolve, reject) => {
        fs.readFile("./state.json", { encoding: "utf-8" }, (err, data) => {
            if (err) {
                if (err.code === "ENOENT") {
                    // No existing state to restore, so just use the default state info
                    console.log("Starting from default state...");
                    return resolve(state);
                }
                // On an actual error, fail
                return reject(err);
            }
            resolve(JSON.parse(data));
        });
    });
}

function saveState() {
    return new Promise((resolve, reject) => {
        fs.writeFile("./state.json", JSON.stringify(state), { encoding: "utf-8" }, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

function initialize() {
    loadState().then(loadedState => {
        state = loadedState;

        checkTrumpTweets();
    }).catch(err => {
        console.error("FATAL: couldn't restore state from state.json:", err);
    });
}

function schedule() {
    cycleTimeout = setTimeout(checkTrumpTweets, CYCLE_INTERVAL);
}

function checkTrumpTweets() {
    twitter.get("statuses/user_timeline", {
        screen_name: "realDonaldTrump",
        include_rts: false,
        tweet_mode: "extended",
        since_id: state.lastTweetId,
    }).then(tweets => {
        if (tweets.length > 0) {
            tweets.map(processTweet);
            state.lastTweetId = tweets[0].id;
            saveState().then(() => {
                schedule();
            }).catch(err => {
                console.error("WARNING: Couldn't persist state to state.json. Continuing, but if process restarts we might see duplicate tweets");
                schedule();
            });
        } else {
            console.log("No new tweets this cycle");
            schedule();
        }
    }).catch(err => {
        console.error(err);
    });
}

function processTweet(tweet) {
    captureScreenshot(tweet).then(image => {
        twitter.post("media/upload", { media: image }).then(media => {
            twitter.post("statuses/update",  {
                status: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
                media_ids: media.media_id_string,
            }).then(tweet => {
                console.log("Sent tweet");
            }).catch(err => {
                console.error("Couldn't send tweet:", err);
            });
        }).catch(err => {
            console.error("FATAL: couldn't upload media:", err);
        });
    }).catch(err => {
        console.error("FATAL: couldn't capture screenshot");
    });
}

function captureScreenshot(tweet) {
    return new Promise((resolve, reject) => {
        let child = spawn("./phantomjs", ["render-tweet.js"]);

        let output = null;

        child.stdin.write(JSON.stringify(tweet));
        child.stdin.end();
        child.stdout.on("data", (data) => {
            if (! output) {
                output = data;
            } else {
                output = Buffer.concat([output, data]);
            }
        });
        child.stderr.on("data", (data) => {
            console.error(`FATAL: renderer sent to stderr: ${data}`);
            return reject();
        });
        child.on("close", (code) => {
            if (code !== 0) {
                console.error("FATAL: renderer exited with code", code);  
                return reject(code);  
            }
            resolve(output);
        });
    });
}

initialize();