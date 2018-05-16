const Twitter = require("twitter");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const twitterConfig = require("./config");

const CYCLE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MESSAGES = [
    "Imagine if President Hillary Clinton tweeted this",
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
        count: 5,
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
            twitter.post("statuses/update", {
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
        console.error("FATAL: couldn't capture screenshot", err);
    });
}

function captureScreenshot(tweet) {
    return new Promise((resolve, reject) => {
        puppeteer.launch().then(async browser => {
            let page = await browser.newPage();
            await page.goto("file:///" + path.resolve(__dirname, "tweet-renderer/tweet.html"));
            let clipRect = await page.evaluate(tweet => {
                function parseTweetText(tweet) {
                    var tweetText;
                    if (tweet.truncated) {
                        if (tweet.extended_tweet) {
                            tweetText = tweet.extended_tweet.full_text;
                        }
                    }
                    if (! tweetText) {
                        tweetText = tweet.full_text || tweet.text;
                    }
                    return tweetText;
                }
        
                var $ = function(id) { return document.getElementById(id); };
                var clipRect = {};
        
                var tweetText = parseTweetText(tweet);
                if (! tweet.quoted_status) {
                    $("render-quote-tweet").style.display = "none";
                } else {
                    $("render-quote-tweet-name").textContent = tweet.quoted_status.user.name;
                    $("render-quote-tweet-username").textContent = tweet.quoted_status.user.screen_name;
                    $("render-quote-tweet-verified").style.display = tweet.quoted_status.user.verified ? "" : "none";
                    $("render-quote-tweet-text").textContent = parseTweetText(tweet.quoted_status);
                    
                    // Slightly hacky way to get rid of the t.co URL for quote tweets
                    for (var i=0; i<tweet.entities.urls.length; i++) {
                        var entity = tweet.entities.urls[i];
                        if (entity.expanded_url.replace(
                            new RegExp("^https://twitter.com/" + tweet.quoted_status.user.screen_name + "/status/(\\d+)"), "$1")
                            == tweet.quoted_status.id_str) {
                                tweetText = tweetText.replace(entity.url, "");
                            }
                    }
                }
                $("render-tweet-text").textContent = tweetText;
        
                var rect = $("render-tweet").getBoundingClientRect();
                clipRect.x = rect.left;
                clipRect.y = rect.top;
                clipRect.width = rect.width;
                clipRect.height = rect.height;
        
                return Promise.resolve(clipRect);
            }, tweet)
            let image = await page.screenshot({
                clip: clipRect,
            });
            browser.close();
            return resolve(image);
        });
    });
}

initialize();