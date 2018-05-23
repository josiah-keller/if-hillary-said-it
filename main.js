module.exports = function main(Twitter, puppeteer, twitterConfig, StateManager, TweetRenderer) {
    const CYCLE_INTERVAL = 5 * 60 * 1000; // 5 minutes
    const MESSAGES = [
        "Imagine if President Hillary Clinton tweeted this",
        "How would you feel if Hillary Clinton were president and said something like this?",
        "Would you be outraged at Hillary Clinton saying this? Then why aren't you outraged at Donald Trump?",
        "What if Hillary Clinton made a comment like this as president?",
        "Donald Trump just said this.  What if it had been Hillary Clinton instead?",
        "Do you think Trump supporters would like this tweet if it was from Hillary Clinton?",
    ];

    let cycleTimeout, twitter = new Twitter(twitterConfig), stateManager = new StateManager(), tweetRenderer = new TweetRenderer(puppeteer);

    function initialize() {
        stateManager.loadState().then(state => {
            if (state.lastTweetId === "1") {
                console.log("Starting from default state...");
            }

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
            since_id: stateManager.state.lastTweetId,
            count: 5,
        }).then(tweets => {
            if (tweets.length > 0) {
                tweets.map(processTweet);
                stateManager.state.lastTweetId = tweets[0].id_str;
                stateManager.saveState().then(() => {
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
        tweetRenderer.captureScreenshot(tweet).then(image => {
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

    initialize();
};