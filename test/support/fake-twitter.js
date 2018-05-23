module.exports = class FakeTwitter {
    constructor(config) {
        this.tweets = [];
        this.config = config;
    }
    async post(endpoint, params) {
        console.log("POST", endpoint, params);
        return {
            media_id_string: "1",
        };
    }
    async get(endpoint, params) {
        console.log("GET", endpoint, params);
        return this.tweets;
    }
};