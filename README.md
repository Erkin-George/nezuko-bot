# nezuko-bot
This bot uses JS Node to pull a meme from Reddit once a day. The configuration file is not uploaded for security purposes, but it connects the bot with the Reddit API. 

There needs to be a config folder, with two files. One is named config.js and the other is named secrets.js. Their layout is as follows:

##config
```{{
    "dev": {
        "reddit": {
            "subreddit": ["goodanimemes","aww","memes","ProgrammerHumor"]
        },
        "discord": {
            "animeChannelID": "679950087451181086",
            "archiveId": "681332065022771200",
            "channelMemes": "699463251607552010",
            "channelNeet": "699463251607552010"
        },
        "fixedcontent": {
            "throwbackthursdaylink": "https://www.youtube.com/watch?v=Q8hp2IkI2es",
            "maneatermondaylink": "https://www.youtube.com/watch?v=_0L2idUbXxw",
            "specialperson": "693154581298806825",
            "padoru": "https://www.youtube.com/watch?v=YsU8r77Fras"
        }
    },
    "prod": {
        "reddit": {
            "subreddit": ["goodanimemes","aww","memes","ProgrammerHumor"]
        },
        "discord": {
            "animeChannelID": "638509044339834900",
            "archiveId": "671583267157442560",
            "channelNeet": "653093579287166987",
            "channelMemes": "632081243986460692"

        },
        "fixedcontent": {
            "throwbackthursdaylink": "https://www.youtube.com/watch?v=Q8hp2IkI2es",
            "maneatermondaylink": "https://www.youtube.com/watch?v=_0L2idUbXxw",
            "specialperson": "693154581298806825",
            "padoru": "https://www.youtube.com/watch?v=YsU8r77Fras"
        }
    }
}

The dev and prod environments are configured so the bot can run on two servers, one for testing and one for actual use. 
