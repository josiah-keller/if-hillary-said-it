const path = require("path");
const parseTweetText = require("./parse-tweet-text");

module.exports = class TweetRenderer {
    constructor(puppeteer) {
        this.puppeteer = puppeteer;
    }
    async captureScreenshot(tweet, hillaryProfile) {
        let browser = await this.puppeteer.launch();
        let page = await browser.newPage();
        await page.goto("file:///" + path.resolve(__dirname, "tweet-renderer/tweet.html"));
        await page.addScriptTag({ content: parseTweetText.toString() });
        let clipRect = await page.evaluate((tweet, hillaryProfile) => {
            var $ = function(id) { return document.getElementById(id); };
            let promises = [];
            var clipRect = {};
    
            var tweetText = parseTweetText(tweet);
            if (! tweet.quoted_status) {
                $("render-quote-tweet").style.display = "none";
            } else {
                $("render-quote-tweet-name").textContent = tweet.quoted_status.user.name;
                $("render-quote-tweet-username").textContent = tweet.quoted_status.user.screen_name;
                $("render-quote-tweet-verified").style.display = tweet.quoted_status.user.verified ? "" : "none";
                $("render-quote-tweet-text").innerHTML = parseTweetText(tweet.quoted_status);
                
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
            $("render-tweet-text").innerHTML = tweetText;
            
            $("profile-pic").src = hillaryProfile.profile_image_url;
            promises.push(new Promise((resolve, reject) => {
                $("profile-pic").addEventListener("load", () => {
                    resolve();
                });
                $("profile-pic").addEventListener("error", () => {
                    reject();
                });
            }));
            
            var rect = $("render-tweet").getBoundingClientRect();
            clipRect.x = rect.left;
            clipRect.y = rect.top;
            clipRect.width = rect.width;
            clipRect.height = rect.height;
    
            return Promise.all(promises).then(() => clipRect);
        }, tweet, hillaryProfile);
        let image = await page.screenshot({
            clip: clipRect,
        });
        browser.close();
        return image;
    };
};