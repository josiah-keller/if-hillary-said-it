module.exports = class FakeStateManager {
    constructor() {
        this.state = {
            lastTweetId: "1",
        };
    };
    loadState() {
        return Promise.resolve(this.state);
    };
    saveState() {
        return Promise.resolve();
    };
}