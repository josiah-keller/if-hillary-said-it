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

function initialize() {
    checkTrumpTweets();

    //schedule();
}

function schedule() {
    cycleTimeout = setTimeout(checkTrumpTweets, CYCLE_INTERVAL);
}

function checkTrumpTweets() {
    twitter.get("statuses/user_timeline", {
        screen_name: "realDonaldTrump",
        include_rts: false,
        tweet_mode: "extended",
        count: 1,
        since_id: state.lastTweetId,
    }).then(tweets => {
        if (tweets.length > 0) {
            processTweet(tweets[0]);
        }
    }).catch(err => {
        console.error(err);
    })
}

function processTweet(tweet) {
    captureScreenshot(tweet).then(image => {
        twitter.post("media/upload", { media: image }).then(media => {
            twitter.post("statuses/update",  {
                status: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
                media_ids: media.media_id_string
            }).then(tweet => {
                console.log("Sent tweet", tweet);
            }).catch(err => {
                console.log("Couldn't send tweet:", err);
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
                output = Buffer.concat(output, data);
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