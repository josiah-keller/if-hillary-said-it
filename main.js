const parseTweetText = require("./parse-tweet-text");

module.exports = function main(options, Twitter, puppeteer, twitterConfig, StateManager, TweetRenderer, MessageSelector) {
    const CYCLE_INTERVAL = 5 * 60 * 1000; // 5 minutes

    let cycleTimeout, twitter = new Twitter(twitterConfig), stateManager = new StateManager(), tweetRenderer = new TweetRenderer(puppeteer), messageSelector = new MessageSelector();

    function initialize() {
        stateManager.loadState().then(state => {
            if (state.lastTweetId === "1") {
                if (! options.silent) console.log("Starting from default state...");
            }

            checkTrumpTweets();
        }).catch(err => {
            console.error("FATAL: couldn't restore state from state.json:", err);
        });
    }

    function schedule() {
        if (options.once) return;
        cycleTimeout = setTimeout(checkTrumpTweets, CYCLE_INTERVAL);
    }

    function checkTrumpTweets() {
        twitter.get("statuses/user_timeline", {
            screen_name: "realDonaldTrump",
            include_rts: false,
            tweet_mode: "extended",
            since_id: stateManager.state.lastTweetId,
            count: 5,
        }).then(tweets => {
            if (tweets.length > 0) {
                let promises = tweets.map(processTweet);

                if (options.cycleCompleteCallback) {
                    Promise.all(promises).then(() => {
                        options.cycleCompleteCallback();
                    });
                }

                stateManager.state.lastTweetId = tweets[0].id_str;
                stateManager.saveState().then(() => {
                    schedule();
                }).catch(err => {
                    console.error("WARNING: Couldn't persist state to state.json. Continuing, but if process restarts we might see duplicate tweets");
                    schedule();
                });
            } else {
                if (! options.silent) console.log("No new tweets this cycle");
                schedule();
            }
        }).catch(err => {
            console.error(err);
        });
    }

    function processTweet(tweet) {
        return new Promise((resolve, reject) => {
            tweetRenderer.captureScreenshot(tweet).then(image => {
                twitter.post("media/upload", { media: image }).then(media => {
                    twitter.post("statuses/update", {
                        status: messageSelector.selectMessage(parseTweetText(tweet)),
                        media_ids: media.media_id_string,
                    }).then(tweet => {
                        if (! options.silent) console.log("Sent tweet");
                        resolve();
                    }).catch(err => {
                        console.error("Couldn't send tweet:", err);
                        reject(err);
                    });
                }).catch(err => {
                    console.error("FATAL: couldn't upload media:", err);
                    reject(err);
                });
            }).catch(err => {
                console.error("FATAL: couldn't capture screenshot", err);
                reject(err);
            });
        })
    }

    initialize();
};