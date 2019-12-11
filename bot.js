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
new CronJob('00 20 16 * * *', function() {
    try {
        r.getSubreddit(config.subreddit).getTop({time: 'day'}, {limit: 10}).then(myListing => {
            var index = Math.floor(Math.random() * 10);
            const channel = client.channels.get(config.channelId);
            channel.send(myListing[index].url);

            client.on('message', message =>{
                if(message.channel == channel)
                {
                    if(message.author.id == client.user.id)
                    {
                        global_message_id = message.id;
                    }
                }
            })

        })
    } catch (error) {
        console.log('There has been a problem with your fetch operation: ', error.message);
    }
}, null, true, 'America/Los_Angeles');

function ReRoll()
{
    try {
        r.getSubreddit(config.subreddit).getTop({time: 'day'}, {limit: 10}).then(myListing => {
            var index = Math.floor(Math.random() * 10);
            const channel = client.channels.get(config.channelId);
            channel.send(myListing[index].url);

            client.on('message', message =>{
                if(message.channel == channel)
                {
                    if(message.author.id == client.user.id)
                    {
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
    client.on('message',message =>{
        if(message.content.includes('headpat') && message.isMemberMentioned(client.user))
        {
            var bite_chance = Math.floor(Math.random() * 10000);
            var person = message.member;
            console.log(bite_chance);
            if(bite_chance == 69)
            {
                message.channel.send('RAWWWWRRR!');
                message.channel.send(person.toString());
            }
            else
            {
                var noises = ['(◡ ω ◡)','Nyaaaaaa','<3','(｡◕‿‿◕｡)'];
                var rand = noises[Math.floor(Math.random() * noises.length)];
                console.log(rand);

                message.channel.send(rand);
            }
        }
    })
//}

client.on('message', message =>
{
    if((message.content.includes("nani the fuck") && message.isMemberMentioned(client.user)) || (message.content.includes("what the fuck") && message.isMemberMentioned(client.user)) ||
    (message.content.includes("what the heck") && message.isMemberMentioned(client.user)) || (message.content.includes("nani the heck") && message.isMemberMentioned(client.user))
    )
    {
        message.channel.send("Gomen'nasai!");
        try{
            
            // var channel = client.channels.get(complaint_id)
            console.log('here is global id during the wtf');
            console.log(global_message_id);

            console.log('heres the bad message id');
            var bad_message = message.channel.fetchMessage(global_message_id).then(bad_message => bad_message.delete(1000)).catch(console.error);
             message.channel.send('Rerolling, Senpai!');
            ReRoll();

        } catch (error){
            console.log('Error is: ', error.message);
        }
    }
    //HeadPat();
})



//id for hidden channel - 507446071488675854
//proper channel - 638509044339834900
client.on("disconnect", function(event){
    console.log('Bot disconnecting');
    process.exit();
});