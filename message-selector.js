const MESSAGES = [
    "Imagine if President Hillary Clinton tweeted this",
    "How would you feel if Hillary Clinton were president and said something like this?",
    "Would you be outraged at Hillary Clinton saying this? Then why aren't you outraged at Donald Trump?",
    "What if Hillary Clinton made a comment like this as president?",
    "Donald Trump just said this.  What if it had been Hillary Clinton instead?",
    "Do you think Trump supporters would like this tweet if it was from Hillary Clinton?",
];
const OPPONENT_REFERENCE_MESSAGES = [
    "Imagine if President Hillary Clinton tweeted something like this about Trump and the GOP",
    "How would you feel if Hillary Clinton said this about the GOP?",
    "Donald Trump just said this - what if Hillary Clinton talked this way about her opponents?",
    "If Clinton talked about her opposition the way Trump talks about his, conservatives would go nuts",
];
const OPPONENT_KEYWORDS = [
    "Hillary",
    "Clinton",
    "Democrats",
    "Democrat",
    "Dems",
    "Dem",
    "Obama",
    "Schumer",
    "Pelosi",
];

module.exports = class MessageSelector {
    isOpponentReference(tweetText) {
        return OPPONENT_KEYWORDS.some(keyword => tweetText.toLowerCase().includes(keyword.toLowerCase()))
    }
    selectMessage(tweetText) {
        let pool = this.isOpponentReference(tweetText) ? OPPONENT_REFERENCE_MESSAGES : MESSAGES;
        return pool[Math.floor(Math.random() * pool.length)];
    }
}