var page = require("webpage").create();
var system = require("system");

var jsonStr = system.stdin.read(), tweet, clipRect;

try {
    tweet = JSON.parse(jsonStr);
} catch(e) {
    console.log(jsonStr);
    console.log("FATAL:", e);
}

page.open("./tweet-renderer/tweet.html", function(status) {
    page.viewportSize = { width: 1920, height: 1080 };
    
    clipRect = page.evaluate(function(tweet) {
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
        clipRect.left = rect.left;
        clipRect.top = rect.top;
        clipRect.width = rect.width;
        clipRect.height = rect.height;

        return clipRect;
    }, tweet);

    page.clipRect = clipRect;
    page.render("tweet.png");

    phantom.exit();
});