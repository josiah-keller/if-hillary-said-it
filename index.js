const Twitter = require("twitter");
const { spawn } = require("child_process");
const twitterConfig = require("./config");

const CYCLE_INTERVAL = 5 * 60 * 1000; // 5 minutes

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
    // twitter.get("statuses/user_timeline", {
    //     screen_name: "realDonaldTrump",
    //     include_rts: false,
    //     tweet_mode: "extended",
    //     count: 1,
    //     since_id: state.lastTweetId,
    twitter.get("statuses/show/989225812166696960", {
        tweet_mode: "extended",
    }).then(tweets => {
        //if (tweets.length > 0) {
            processTweet(tweets);
        //}
    }).catch(err => {
        console.error(err);
    })
}

function processTweet(tweet) {
    captureScreenshot(tweet);
}

function captureScreenshot(tweet) {
    let child = spawn("./phantomjs", ["render-tweet.js"]);
    child.stdin.write(JSON.stringify(tweet));
    child.stdin.end();
    child.stdout.on("data", (data) => {
        console.log(`${data}`);
    });
    child.stderr.on("data", (data) => {
        console.log(`${data}`);
    });
    child.on("close", (code) => {
        console.log("Closed with code", code);
    });
}

initialize();