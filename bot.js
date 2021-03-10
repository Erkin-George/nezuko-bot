const Discord = require("discord.js");
// const ytdl = require('ydtl-core');
const snoowrap = require("snoowrap");
const config = require("./config/config.json")[process.env.NODE_ENV || "dev"];
const secrets = require("./config/secrets.json")[process.env.NODE_ENV || "dev"];
const client = new Discord.Client();
const maxLinks = 10;

var CronJob = require("cron").CronJob;
var redditLinks = [];
var messageHistory = [];
var archiveHistory = [];

// When the client is ready, run this code
// This event will only trigger one time after logging in
client.once("ready", () => {
  console.log("Ready!");
});

// Login to Discord with your app's token
client.login(secrets.discord.token).then(() => {
  console.log("Logged in!");
});

// Setup oAuth for Reddit Api calls
const r = new snoowrap({
  userAgent: "A Discord Bot that ocassionally posts content links from given subreddits to Discord",
  clientId: secrets.reddit.clientId,
  clientSecret: secrets.reddit.clientSecret,
  username: secrets.reddit.username,
  password: secrets.reddit.password,
});

// Job runs at 16:20:00 every day
// Gets all the image links of the day and puts them in a random order
new CronJob(
  "00 20 16 * * *",
  () => {
    dailyRedditPost();
  },
  null,
  true,
  "America/Los_Angeles"
);

// Job runs weekly at 15:00
new CronJob(
  "00 00 15 * * Thu",
  () => {
    throwBackThursday();
  },
  null,
  true,
  "America/Los_Angeles"
);

// Job runs weekly at 15:00
new CronJob(
  "00 00 13 * * Mon",
  () => {
    manEaterMonday();
  },
  null,
  true,
  "America/Los_Angeles"
);

//Job runs during December
new CronJob(
  "00 00 20 * * Fri",
  () => {
    //padoru();
  },
  null,
  true,
  "America/Los_Angeles"
);
// Job that pulls from r/awww daily?

client.on("message", (message) => {
  if (!message.isMemberMentioned(client.user || message.author.bot)) {
    return;
  }

  if (message.content.match(/(headpat|head pat)/gi) != null) {
    headpat(message);
  } else if (message.content.match(/(nani|what) the (frick|heck|fuck|degen)/gi)) {
    reroll(message, "degenerate");
  } else if (message.content.match(/(degen|degenerate|no)/gi)) {
    reroll(message, "degenerate");
  } else if (message.content.match(/(degen|degenerate|no|I am sick of all this weeb shit)/gi)) {
    reroll(message, "degenerate");
  } else if (message.content.match(/meme please/gi)) {
    dailyRedditPost();
  } else if (message.content.match(/(boring|lame|try again)/gi)) {
    reroll(message, "boring");
  } else if (message.content.match(/(go back|undo)/gi)) {
    unarchive(message.channel);
  } else if (message.content.match(/thursday/gi)) {
    throwBackThursday();
  } else if (message.content.match(/monday/gi)) {
    manEaterMonday();
  } else if (message.content.match(/friday/gi)) {
    funkyFriday();
  } else if (message.content.match(/uwu/gi)) {
    padoru();
  } else if (!message.content.match(/here/gi)) {
    var confusedReact = message.guild.emojis.find((emoji) => emoji.name === "nezukoconfused");
    message.channel.send(confusedReact.toString());
  }
});

function dailyRedditPost() {

  resetPosts();

  var configLength = config.reddit.subreddit.length;
  var configNumber = parseInt(Math.random() * (configLength -1));
  console.log(configLength)
  var sub = config.reddit.subreddit[configNumber];
  if(sub == undefined) {
    console.log("Unable to find an appropriate value from the array");
  }

  r.getSubreddit(sub)
    .getTop({ time: "day", limit: maxLinks })
    .then((topPosts) => {
      var post;
      for (post of topPosts) {
        redditLinks.push(post.url);
      }

      // Sort in random order
      redditLinks.sort(() => {
        return 0.5 - Math.random();
      });

      channel = client.channels.get(config.reddit.discord_channel[configNumber]);  
      // Send first link
      sendNextPost(channel);
    })
    .catch((reason) => {
      console.error("There has been a problem with your fetch operation: ", reason);
    });
}

function resetPosts() {
  redditLinks = [];
}

function hasMorePosts() {
  return redditLinks.length > 0;
}

// Send the next post from the stack
// Returns true on success, false if the stack is empty
function sendNextPost(channel) {
  if (!hasMorePosts()) {
    return false;
  }
  channel.send(redditLinks.pop()).then((message) => {
    messageHistory.push(message);
  });

  return true;
}

function unarchive(channel) {
  // Take the current message and put it back into the queue
  let currentMsg = messageHistory.pop();
  redditLinks.push(currentMsg.content);
  currentMsg.delete().then(() => {
    // Get the last archived message and put it back in the channel
    let lastArchived = archiveHistory.pop();
    if (!lastArchived) {
      channel.send("ごめんね Gomen-ne. I can't go back any further");
      return;
    }
    let matches = lastArchived.content.match(/http.*/);
    if (!matches) {
      return;
    }
    channel.send(`どうぞ Douzo!\n${matches[0]}`).then((message) => {
      messageHistory.push(message);
      lastArchived.delete();
    });
  });
}

function headpat(message) {
  var bite_chance = Math.floor(Math.random() * 100);
  var person = message.member;
  console.log(bite_chance);
  if (bite_chance == 69) {
    message.channel.send("RAWWWWRRR!");
    message.channel.send(person.toString());
  } else {
    var noises = ["(◡ ω ◡)", "Nyaaaaaa", "<3", "(｡◕‿‿◕｡)"];
    var rand = noises[Math.floor(Math.random() * noises.length)];
    console.log(rand);
    message.channel.send(rand);
  }
}

function reroll(message, reason) {
  message.channel.send("ごめんなさい Gomen'nasai!");

  if (!deletePreviousPost(message, reason)) {
    message.channel.send("I can't delete it!");
    return;
  }

  if (hasMorePosts()) {
    message.channel.send("Rerolling, Senpai!");
    sendNextPost(message.channel);
  } else {
    message.channel.send(
      "みんなさ, すみません Minasan, sumimasen! We're out of rerolls for the day."
    );
  }
}

function deletePreviousPost(requester, reason) {
  if (messageHistory.length === 0) {
    return true;
  }

  let degenerateMessage = messageHistory.pop();
  const archiveChannel = client.channels.get(config.discord.archiveId);

  archiveChannel
    .send(
      `Post deletion requested by ${requester.username}\n> ${reason}\n${degenerateMessage.content}`
    )
    .then((message) => {
      archiveHistory.push(message);
      return degenerateMessage.delete();
    })
    .catch((error) => {
      console.log("Could not delete message\n" + error);
    });

  return true;
}

function hasPermission(member, minRoleName) {
  var minRole = member.guild.roles.find(
    (role) => role.name.toLowerCase() === minRoleName.toLowerCase()
  );
  if (!minRole) {
    console.log("There is no role " + minRoleName);
    return false;
  }

  return member.highestRole.comparePositionTo(minRole) >= 0;
}

function throwBackThursday() {
  const channel = client.channels.get(config.discord.animeChannelID);
  channel.send(config.fixedcontent.throwbackthursdaylink);
  channel.send("<@" + config.fixedcontent.specialperson + ">");
  return true;
}

function manEaterMonday() {
  const channel = client.channels.get(config.discord.animeChannelID);
  channel.send(config.fixedcontent.maneatermondaylink);
  return true;
}

function padoru() {
  const channel = client.channels.get(config.discord.animeChannelID);
  channel.send(config.fixedcontent.padoru);
  return true;
}

client.on("disconnect", function () {
  console.log("Bot disconnecting");
  process.exit();
});
