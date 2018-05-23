const Twitter = require("twitter");
const puppeteer = require("puppeteer");
const twitterConfig = require("./config");
const StateManager = require("./state");

const main = require("./main");

main(Twitter, fs, path, puppeteer, twitterConfig, StateManager);