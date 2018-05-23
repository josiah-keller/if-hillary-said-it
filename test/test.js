const assert = require("assert");
const fs = require("fs");
const promisify = require("util").promisify;
const puppeteer = require("puppeteer");

const StateManager = require("../state");
const TweetRenderer = require("../tweet-renderer");

const FakeTwitter = require("./support/fake-twitter");
const FAKE_TWEETS = require("./support/fake-tweets");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const rename = promisify(fs.rename);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

describe("IfHillarySaidIt", function() {
    let runId = new Date().getTime();
    let artifactsPath = `./test/artifacts/${runId}`;

    before(`Test artifacts will be saved to ${artifactsPath}`, async function() {
        if (! fs.existsSync("./test/artifacts")) {
            await mkdir("./test/artifacts");
        }
        await mkdir(`${artifactsPath}`);
    });

    describe("State", function() {
        before("Preserving any existing state.json...", async function() {
            if (fs.existsSync("./state.json")) {
                await rename("./state.json", `${artifactsPath}/state.json`);
            }
        });

        it("should load default state when no existing state", async function() {
            let stateManager = new StateManager();
            let state = await stateManager.loadState();
            assert.strictEqual(state.lastTweetId, "1");
        });
        it("should load old state when it exists", async function() {
            let stateManager = new StateManager();
            let fakeState = {
                lastTweetId: Math.floor(Math.random() * 10000).toString(10),
            };
            await writeFile("./state.json", JSON.stringify(fakeState), "utf-8");
            let state = await stateManager.loadState();
            assert.strictEqual(state.lastTweetId, fakeState.lastTweetId);
        });
        it("should save state", async function() {
            let stateManager = new StateManager();
            let randomId = Math.floor(Math.random() * 10000).toString(10);
            stateManager.state.lastTweetId = randomId;
            await stateManager.saveState();
            let data = await readFile("./state.json");
            let state = JSON.parse(data);
            assert.strictEqual(state.lastTweetId, randomId);
        });

        after("Cleaning up/restoring old state.json...", async function() {
            await unlink("./state.json");
            if (fs.existsSync(`${artifactsPath}/state.json`)) {
                await rename(`${artifactsPath}/state.json`, "./state.json")
            }
        });
    });
    describe("Tweet Renderer", function() {
        let tweetRenderer = new TweetRenderer(puppeteer);
        FAKE_TWEETS.forEach(function(tweet, i) {
            it(`renders ${tweet._testDesc} without errors (manually verify at ${artifactsPath}/${i}.png`, async function() {
                let imageData = await tweetRenderer.captureScreenshot(tweet);
                await writeFile(`${artifactsPath}/${i}.png`, imageData);
            });
        });
    });
});