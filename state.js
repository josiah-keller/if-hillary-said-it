const fs = require("fs");

module.exports = class StateManager {
    constructor() {
        this.state = {
            lastTweetId: "1",
        };
    };
    loadState() {
        return new Promise((resolve, reject) => {
            fs.readFile("./state.json", { encoding: "utf-8" }, (err, data) => {
                if (err) {
                    if (err.code === "ENOENT") {
                        // No existing state to restore, so just use the default state info
                        return resolve(this.state);
                    }
                    // On an actual error, fail
                    return reject(err);
                }
                this.state = JSON.parse(data);
                resolve(this.state);
            });
        });
    };
    saveState() {
        return new Promise((resolve, reject) => {
            fs.writeFile("./state.json", JSON.stringify(this.state), { encoding: "utf-8" }, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    };
}