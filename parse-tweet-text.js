module.exports = function parseTweetText(tweet) {
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
};