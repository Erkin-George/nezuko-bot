const Discord = require('discord.js');
const config = require('./config.json');
const snoowrap = require('snoowrap');
const client = new Discord.Client();
const maxLinks = 10;

var CronJob = require('cron').CronJob;
var redditLinks = [];
var forbiddenLinks = [];

global.last_discord_post_id = "";

// When the client is ready, run this code
// This event will only trigger one time after logging in
client.once('ready', () => {
    console.log('Ready!');
});

// Login to Discord with your app's token
client.login(config.token);

// Setup oAuth for Reddit Api calls
const r = new snoowrap({
    userAgent: "A Discord Bot that ocassionally posts content links from given subreddits to Discord (by u/ShadowAssassin96",
    clientId: config.clientId,
    clientSecret: config.secret,
    username: config.username,
    password: config.password
});

// Job runs at 16:20:00 every day
// Gets all the image links of the day and puts them in a random order
new CronJob('00 30 16 * * *', function() {
    try {
        r.getSubreddit(config.subreddit).getTop({time: 'day', limit: maxLinks}).then(topPosts => {
            var post;
            for (post of topPosts) {
                redditLinks.push(post.url);
               // forbiddenLinks.push(post.url);
            }

            // Sort in random order
            redditLinks.sort(function(a, b) {
                return 0.5 - Math.random()
            });

            // Send first link
            sendNextPost();
        })
    } catch (error) {
        console.log('There has been a problem with your fetch operation: ', error.message);
    }
}, null, true, 'America/Los_Angeles');

function hasMorePosts() {
	return redditLinks.length > 0;
}

// Send the next post from the stack
// Returns true on success, false if the stack is empty
function sendNextPost() {
	if(!hasMorePosts()) {
		return false;
	}

	const channel = client.channels.get(config.channelId);
    channel.send(redditLinks.pop());

    // Record the last reddit link we sent last in case we need to delete it
    var regex = new RegExp('https.*redd', 'gi');
    client.on('message', message => {
        if (message.channel == channel && message.author.id == client.user.id && message.content.match(regex) != null) {
            last_discord_post_id = message.id;
        }
    })

	return true;
}

function deletePreviousPost(message) {
	try {
		message.channel.fetchMessage(last_discord_post_id).then(badMessage => badMessage.delete(1000)).catch(console.error);
		return true;
	} catch (error) {
		console.log('Error is: ', error.message);
	}

	return false;
}

// Headpats
client.on('message', message => {
    var regex = new RegExp('headpat', 'gi');
    if (message.content.match(regex) != null && message.isMemberMentioned(client.user)) {
        var bite_chance = Math.floor(Math.random() * 100);
        var person = message.member;
        console.log(bite_chance);
        if (bite_chance == 69) {
            message.channel.send('RAWWWWRRR!');
            message.channel.send(person.toString());
        } else {
            var noises = ['(◡ ω ◡)', 'Nyaaaaaa', '<3', '(｡◕‿‿◕｡)'];
            var rand = noises[Math.floor(Math.random() * noises.length)];
            console.log(rand);

            message.channel.send(rand);
        }
    }
})

// Rerolling
client.on('message', message => {
    var regex = new RegExp('(nani|what) the (frick|heck|fuck)', 'gi');
    if (message.content.match(regex) != null && message.isMemberMentioned(client.user)) {
        message.channel.send("ごめんなさい Gomen'nasai!");
        
        //const archive = client.channels.find('name', forbidden-archives);
        //archive.send(forbiddenLinks.pop());
        
        if(!deletePreviousPost(message)) {
			message.channel.send("I can't delete it!");
			return;
		}

		if(hasMorePosts()) {
        	message.channel.send('Rerolling, Senpai!');
			sendNextPost();
		} else {
		    message.channel.send("みんなさ, すみません Minasan, sumimasen! We're out of rerolls for the day.");
		}
    }
})

//id for hidden channel - 507446071488675854
//proper channel - 638509044339834900
client.on("disconnect", function(event) {
    console.log('Bot disconnecting');
    process.exit();
});
