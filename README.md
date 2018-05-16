# What if Hillary said it?
This is a Twitter bot that checks every 5 minutes for tweets from President Donald Trump and generates fake screenshots of what the same tweet would look like if Hillary Clinton had tweeted them.  It's inspired by [this tweet by Tom Nichols](https://twitter.com/RadioFreeTom/status/995751219766415363).

I've published the source code here because I believe in open source, but if you like the idea please refer to the original account [@IfHillarySaidIt](https://twitter.com/IfHillarySaidIt) rather than making a copycat account.

## Installation & Usage
This documentation is as much for myself as anyone.

To install, follow these steps:

0. Install Node, npm, etc.
1. Clone this repo
2. Run `npm install`
3. Add Twitter configuration info:
Create a file called `config.js` that looks like this:

```js
module.exports =  {
    consumer_key: "...",
    consumer_secret: "...",
    access_token_key: "...",
    access_token_secret: "...",
};
```

You can get this info from the Twitter API application manager panel.  To get the access token, you'll have to click the button that gives you an access token for your own account.

4. Run it with `node index.js`.

## License
This software is available under the MIT License.