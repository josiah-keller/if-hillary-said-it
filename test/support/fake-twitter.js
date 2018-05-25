class FakeTwitter {
    constructor(config) {
        this.config = config;
    }
    async post(endpoint, params) {
        FakeTwitter.callback("POST", endpoint, params);
        return {
            media_id_string: "1",
        };
    }
    async get(endpoint, params) {
        FakeTwitter.callback("GET", endpoint, params);
        return FakeTwitter.tweets;
    }
};

FakeTwitter.tweets = [];
FakeTwitter.callback = function() { };

module.exports = FakeTwitter;