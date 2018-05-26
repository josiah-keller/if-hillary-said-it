const Twitter = require("twitter");
const puppeteer = require("puppeteer");
const twitterConfig = require("./config");
const StateManager = require("./state");
const TweetRenderer = require("./tweet-renderer");
const MessageSelector = require("./message-selector");

const main = require("./main");

main({ once: false }, Twitter, puppeteer, twitterConfig, StateManager, TweetRenderer, MessageSelector);