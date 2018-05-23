module.exports = [
    // Non-extended tweet
    {
        "created_at": "Thu May 24 15:24:15 +0000 2018",
        "id_str": "850006245121695744",
        "text": "Wow, dishonest media very bad & stuff!\nhttps:\/\/t.co\/dEa5dBe3EF",
        "user": {
            "id": 2244994945,
            "name": "A User",
            "screen_name": "user",
            "location": "Internet",
            "url": "https:\/\/example.com\/",
            "description": "I'm nobody"
        },
        "entities": {
            "hashtags": [      
            ],
            "urls": [
            {
                "url": "https:\/\/t.co\/dEa5dBe3EF",
                "unwound": {
                "url": "https:\/\/example.com\/",
                "title": "Foobar"
                }
            }
            ],
            "user_mentions": [     
            ]
        },
        "_testDesc": "non-extended tweet"
    },
    // Extended tweet (from https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/intro-to-tweet-json)
    {
        "created_at": "Thu May 24 17:41:57 +0000 2018",
        "id_str": "994633657141813248",
        "text": "Just another Extended Tweet with more than 140 characters, generated as a documentation example, showing that [\"tru… https://t.co/U7Se4NM7Eu",
        "display_text_range": [0, 140],
        "truncated": true,
        "user": {
            "id_str": "944480690",
            "screen_name": "FloodSocial"
        },
        "extended_tweet": {
            "full_text": "Just another Extended Tweet with more than 140 characters, generated as a documentation example, showing that [\"truncated\": true] and the presence of an \"extended_tweet\" object with complete text and \"entities\" #documentation #parsingJSON #GeoTagged https://t.co/e9yhQTJSIA",
            "display_text_range": [0, 249],
            "entities": {
                "hashtags": [{
                    "text": "documentation",
                    "indices": [211, 225]
                }, {
                    "text": "parsingJSON",
                    "indices": [226, 238]
                }, {
                    "text": "GeoTagged",
                    "indices": [239, 249]
                }]
            }
    
        },
        "entities": {
            "hashtags": []
        },
        "_testDesc": "extended tweet"
    },
    // Old-style quote tweet (adapted from https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/intro-to-tweet-json)
    {
        "text": "My added comments to this Tweet ---> https:\/\/t.co\/LinkToTweet",
        "user": {
            "screen_name": "TweetQuoter"
        },
        "quoted_status": {
            "text": "original message",
            "user": {
                "name": "Original Tweeter",
                "screen_name": "OriginalTweeter",
                "verified": true
            },
            "place": {      
            },
            "entities": {      
            },
            "extended_entities": {      
            }
        },
        "place": {    
        },
        "entities": {
            "urls": [
                {
                    "url": "https:\/\/t.co\/LinkToTweet",
                    "expanded_url": "https:\/\/twitter.com\/OriginalTweeter\/status\/994281226797137920"
                }
            ]
        },
        "_testDesc": "old-style quote tweet"
    },
    // New-style quote tweet (ibid)
    {
        "text": "My added comments to this Tweet",
        "user": {
            "screen_name": "TweetQuoter"
        },
        "quoted_status": {
            "text": "original message",
            "user": {
                "name": "Original Tweeter",
                "screen_name": "OriginalTweeter",
                "verified": true
            },
            "place": {
            },
            "entities": {
            },
            "extended_entities": {
            },
            "quoted_status_permalink": {
                "url": "https:\/\/t.co\/LinkToTweet",
                "expanded": "https:\/\/twitter.com\/OriginalTweeter\/status\/994281226797137920",
                "display": "twitter.com\/OriginalTweeter\/status\/994281226797137920"
            },
        },
        "place": {
        },
        "entities": {
            "urls": [
            ]
        },
        "_testDesc": "new-style quote tweet"
    }  
];