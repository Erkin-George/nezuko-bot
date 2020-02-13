// require the discord.js module
const Discord = require('discord.js');

//grab config file
const config = require('./config.json');

var CronJob = require('cron').CronJob;

// create a new Discord client
const client = new Discord.Client();

const snoowrap = require('snoowrap');

global.global_message_id = "";

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log('Ready!');
});

// login to Discord with your app's token
client.login(config.token);

//setup oAuth for Reddit Api calls
const r = new snoowrap({
    userAgent: "A Discord Bot that ocassionally posts content links from given subreddits to Discord (by u/ShadowAssassin96",
    clientId: config.clientId,
    clientSecret: config.secret,
    username: config.username,
    password: config.password
});


//Get posts from subreddit and posts it to the correct channel
var index = 0; //Declare index here so it persists to ReRoll
var oldIndexes = []; //Same but so it persists between ReRolls - this keeps track of what indexs we already rolled

new CronJob('00 20 16 * * *', function() {
    try {
	oldIndexes = [] //Clear for the new day
        r.getSubreddit(config.subreddit).getTop({time: 'day'}, {limit: 10}).then(myListing => {
            index = Math.floor(Math.random() * 10);
            const channel = client.channels.get(config.channelId);
            channel.send(myListing[index].url);

            client.on('message', message => {
                if(message.channel == channel) {
                    if(message.author.id == client.user.id) {
                        global_message_id = message.id;
                    }
                }
            })
        })
    } catch (error) {
        console.log('There has been a problem with your fetch operation: ', error.message);
    }
}, null, true, 'America/Los_Angeles');

function tenRolls() { //response if we're out of rolls
    const channel = client.channels.get(config.channelId);
    channel.send("みんなさ, すみません Minasan, sumimasen! We're out of rerolls for the day.");

    client.on('message', message => {
        if(message.channel == channel) {
            if(message.author.id == client.user.id) {
                global_message_id = message.id;
            }
        }
    })
}

function ReRoll() { //Reroll sketchy memes
    try {
        oldIndexes.push(index); //Add the last roll to the list
    	if (oldIndexes.length >= 10) { //If we've tried everything, give up
    	    tenRolls();
            return;
    	}
        r.getSubreddit(config.subreddit).getTop({time: 'day'}, {limit: 10}).then(myListing => {
            console.log("oldIndexes are :")
            for (let i = 0; i < oldIndexes.length; i++) {
                console.log(oldIndexes[i]);
            }
            console.log(index)
            index = Math.floor(Math.random() * 10); //roll again
            var rollBool = true; //assume the meme is new
            do {
                var rollBool = true; //reset when looping
                for(let i = 0; i < oldIndexes.length; i++) { //check the whole list
                    if (index == oldIndexes[i]) { //If the index is the same as any index
                        rollBool = false; //reject it
                        break;
            	    }
            	}
                if(!rollBool) { //if rejected, roll again
                    index = Math.floor(Math.random() * 10);
                }
            } while(!rollBool) //continue until rollBool is not changed to false
            const channel = client.channels.get(config.channelId); //post when it finds something
            channel.send(myListing[index].url);

            client.on('message', message => {
                if(message.channel == channel){
                    if(message.author.id == client.user.id){
                        global_message_id = message.id;
                    }
                }
            })
        })
    } catch (error) {
        console.log('There has been a problem with your fetch operation: ', error.message);
    }
}

//function HeadPat()
//{
    client.on('message',message => {
		var regex = new RegExp('headpat', 'gi');
        if(message.content.match(regex) != null && message.isMemberMentioned(client.user)) {
            var bite_chance = Math.floor(Math.random() * 100);
            var person = message.member;
            console.log(bite_chance);
            if(bite_chance == 69) {
                message.channel.send('RAWWWWRRR!');
                message.channel.send(person.toString());
            }
            else {
                var noises = ['(◡ ω ◡)','Nyaaaaaa','<3','(｡◕‿‿◕｡)'];
                var rand = noises[Math.floor(Math.random() * noises.length)];
                console.log(rand);

                message.channel.send(rand);
            }
        }
    })
//}

client.on('message', message => {
	var regex = new RegExp('(nani|what) the (frick|heck|fuck)', 'gi');
    if(message.content.match(regex) != null && message.isMemberMentioned(client.user)){
        message.channel.send("ごめんなさい Gomen'nasai!");
        try{
            // var channel = client.channels.get(complaint_id)
            console.log('here is global id during the wtf');
            console.log(global_message_id);

            console.log('heres the bad message id');
            var bad_message = message.channel.fetchMessage(global_message_id).then(bad_message => bad_message.delete(1000)).catch(console.error);
            message.channel.send('Rerolling, Senpai!');
            ReRoll();

        } catch (error) {
            console.log('Error is: ', error.message);
        }
    }
    //HeadPat();
})



//id for hidden channel - 507446071488675854
//proper channel - 638509044339834900
client.on("disconnect", function(event) {
    console.log('Bot disconnecting');
    process.exit();
});
