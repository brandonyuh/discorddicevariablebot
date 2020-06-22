const auth = require('./auth.json');//make your own auth.json with {"token":"AUTHCODE"}
const Discord = require('discord.js');
const client = new Discord.Client();
const databaseChannelID = "723300080689348688";

const configPrefix = "!";
const configPrefixLength = "1";

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

console.log(client);

client.on('message', msg => {
	text = msg.content;

	const databaseChannel = client.channels.cache.get(databaseChannelID);

	//if (!msg.content.startsWith(configPrefix)) return;	
	//text = text.slice(configPrefixLength)
	text = " " + text;
	author = msg.author;
	//user = author;
	var users = [];

	if (client.user != author) {

		text = text.replace(">", "> ");
		text = text.replace("+", " + ");
		text = text.replace("=", " = ");
		text = text.replace("-", " - ");

		const split = text.split(/ +/);
		for (var i = 0; i < split.length; i++) {
			if (getUserFromMention(split[i])) {
				users.push(getUserFromMention(split[i]))
			}
		}

		if (users.length == 0) {
			users.push(author);
		}
		if (text.search('setdb') != -1) {
			if (!isNaN(split[split.length - 1])) {
				databaseChannelID = split[split.length - 1];
			}
		}
		else if (text.search('=') != -1) {
			var jsonStore = {};

			value = 0;
			resultText = ".\n";

			if (!isNaN(split[split.length - 1])) {
				value = split[split.length - 1];
				for (var u = 0; u < users.length; u++) {
					userText = "<@!" + users[u].id + ">";
					var item = {};
					resultText = resultText + userText + "\n";
					for (var i = 0; i < split.length; i++) {
						if (split[i].match(/^[a-z]+$/i)) {
							resultText = resultText + split[i] + "=" + value + "\n";
							item[split[i].toLowerCase()] = value;
						}
					}
					jsonStore[userText] = item;

				}
			}
			msg.channel.send(resultText);


			for (var key in jsonStore) {
				if (jsonStore.hasOwnProperty(key)) {
					var tempJson = {};
					tempJson[key] = jsonStore[key];

					databaseChannel.messages.fetch({ limit: 100 })
						.then(messages => {
							messageArray = messages.array();
							var foundUserDB = false;
							for (var m = 0; m < messages.array().length; m++) {
								messagejson = JSON.parse(messages.array()[m].content);
								statsjson = messagejson[key];
								if (statsjson != null) {
									foundUserDB = true;
									mergejson = {};
									Object.keys(statsjson).forEach(statKey => mergejson[statKey] = statsjson[statKey]);
									Object.keys(tempJson[key]).forEach(statKey => mergejson[statKey] = tempJson[key][statKey]);
									var wrapjson = {};
									wrapjson[key] = mergejson;
									messages.array()[m].edit(JSON.stringify(wrapjson, undefined, 1));
									break;
								}
							}
							if (!foundUserDB) {
								databaseChannel.send(JSON.stringify(tempJson, undefined, 1));
							}
						})
						.catch(console.error);
				}
			}

		}
		else {
			for (var u = 0; u < users.length; u++) {
				var resultArray = [];
				var displayArray = [];
				var negationArray = [];
				var user = users[u];

				for (var i = 0; i < split.length; i++) {
					if (split[i].match(/^[a-z]+$/i)) {
						displayArray[i] = split[i].toLowerCase();
					}
					else if (split[i] == "+") {
						displayArray[i] = "+";
					}
					else if (split[i] == "-") {
						displayArray[i] = "-";
						negationArray[i + 1] = 1;
					}



					for (var i = 0; i < displayArray.length; i++) {
						if (typeof displayArray[i] != 'undefined') {

						}
					}


				}

				var display = "<@!" + user.id + "> ";
				for (var i = 0; i < displayArray.length; i++) {
					if (typeof displayArray[i] != 'undefined') {
						display = display + displayArray[i] + " ";
					}
				}


				msg.channel.send(display);




			}
		}
		//databaseChannel.send(messages.array().length + "");
		/*
		for (var m = 0; m < messages.array().length; m++) {
			databaseChannel.send(messages.array()[m].content);
		}
		*/
		/*
		databaseChannel.messages.fetch({ limit: 100 })
			.then(messages => {
				//databaseChannel.send(messages.size + "");
				messageArray = messages.array();
				for (var m = 0; m < messages.array().length; m++) {
					msg.channel.send(messages.array()[m].content);
				}
			})
			.catch(console.error);
			*/

		//databaseChannel.send(text);
		//msg.channel.send(text);
		//databaseChannel.channel.send(text);
		/*
		if (getUserFromMention(text)) {

			msg.channel.send("<@!" + getUserFromMention(text).id + ">")
		} else {
			msg.channel.send("no user found");
		}
		*/
	}

	if (msg.content === '!1d20') {
		result = Math.ceil(Math.random() * 20);
		msg.reply(result);
		user = msg.author.username
		msg.channel.send(msg.author.tag + "");
		msg.channel.send(client.user.tag + "");
	}
});



function findInDatabase(key) {

}

function getUserFromMention(mention) {
	if (!mention) return;
	if (mention.search('<@') < mention.search('>') && mention.search('<@') != -1) {
		begin = mention.search('<@') + 2;
		end = mention.search('>');
		mention = mention.slice(begin, end);
		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}
		return client.users.cache.get(mention);
	}
}


client.login(auth.token);