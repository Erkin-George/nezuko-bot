const Discord = require('discord.js');
const config = require('./config.json');
const snoowrap = require('snoowrap');
const client = new Discord.Client();
const maxLinks = 10;

var CronJob = require('cron').CronJob;
var redditLinks = [];
var messageHistory = [];

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
new CronJob('00 20 16 * * *', () => {
    fetchPosts();
}, null, true, 'America/Los_Angeles');

client.on('message', message => {
    if(!message.isMemberMentioned(client.user) || message.author.bot) {
        return;
    }
    
    let sender = message.guild.members.get(message.author.id);

    if (message.content.match(/(headpat|head pat)/gi) != null) {
        headpat(message);
    }
    else if(message.content.match(/(nani|what) the (frick|heck|fuck)/gi)) {
        reroll(message);
    }
    else if(message.content.match(/meme please/gi)) {
        if(!hasPermission(sender, 'officer')) {
            angryReact = message.guild.emojis.find(emoji => emoji.name === 'angryzuko');
            message.channel.send(angryReact.toString());
            return;
        }
        fetchPosts();
    }
    else if(message.content.match(/(boring|lame|try again)/gi)){
        var willarchive = false;
        reroll(message,willarchive)
    }
})

function fetchPosts() {
    r.getSubreddit(config.subreddit).getTop({time: 'day', limit: maxLinks})
    .then(topPosts => {
        var post;
        for (post of topPosts) {
            redditLinks.push(post.url);
        }

        // Sort in random order
        redditLinks.sort(() => { return 0.5 - Math.random() });

        // Send first link
        sendNextPost();
    })
    .catch((reason) => {
        console.error('There has been a problem with your fetch operation: ', reason);
    })
}

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
    
    channel.send(redditLinks.pop())
    .then(message => {
        messageHistory.push(message);
    })

	return true;
}

function headpat(message) {
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

function reroll(message, willarchive=true) {
    message.channel.send("ごめんなさい Gomen'nasai!");
    
    if(!deletePreviousPost(message.author,willarchive)) {
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

function deletePreviousPost(requester,willarchive) {
    if(messageHistory.length === 0) {
        return true;
    }

    let degenerateMessage = messageHistory.pop();

    if(willarchive)
    {
        const archiveChannel = client.channels.get(config.archiveId);

        archiveChannel.send('Post deletion requested by ' + requester.username + '\n' + degenerateMessage.content)
        .then(() => {
            degenerateMessage.delete()
            .catch((reason) => {
                console.log('Could not delete message ' + reason);
            })
        })
        return true;
    }
        degenerateMessage.delete()
        .catch((reason)=> {
            console.log('Could not delete message' + reason);
        })
    return true;
}

function hasPermission(member, minRoleName) {
    var minRole = member.guild.roles.find(role => role.name.toLowerCase() === minRoleName.toLowerCase());
    if(!minRole) {
        console.log('There is no role \"' + minRoleName);
        return false;
    }

    return member.highestRole.comparePositionTo(minRole) >= 0;
}

client.on("disconnect", function(event) {
    console.log('Bot disconnecting');
    process.exit();
});
