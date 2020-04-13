# nezuko-bot
This bot uses JS Node to pull a meme from Reddit once a day. The configuration file is not uploaded for security purposes, but it connects the bot with the Reddit API. 

There needs to be a config folder, with two files. One is named config.js and the other is named secrets.js. Their layout is as follows:

##config
`{`
   ` "dev": {`
        `"reddit": {`
          `  "subreddit": "animemes"`
     `   },`
        `"discord": {`
            `"channelId": "main channel id",`
            "archiveId": "archive channel id"
        },
        "fixedcontent": {
            "throwbackthursdaylink": "https://www.youtube.com/watch?v=Q8hp2IkI2es"
        }
    },
    "prod": {
        "reddit": {
            "subreddit": "animemes"
        },
        "discord": {
            "channelId": "main channel id",
            "archiveId": "archive channel id"
        },
        "fixedcontent": {
            "throwbackthursdaylink": "https://www.youtube.com/watch?v=Q8hp2IkI2es"
        }
    }
}`

The dev and prod environments are configured so the bot can run on two servers, one for testing and one for actual use. 
