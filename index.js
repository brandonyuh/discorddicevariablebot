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
						negationArray[i] = 1;
					}

					if (split[i].match(/^\d*[dD]\d+(\S)*$/)) {
						displayArray[i] = split[i].toLowerCase() + " = ";
						var dice = split[i];
						var numDice = 1;
						var dIndex = dice.indexOf("d");
						if (dIndex != 0) {
							numDice = parseInt(dice.substring(0, dIndex));
						}
						var keepDice = numDice;
						var keepHigher = true;

						var endDiceIndex = dIndex + 1;
						var diceType = 20;

						while (endDiceIndex < dice.length && dice.charAt(endDiceIndex).match(/[0-9]/)) {
							endDiceIndex = endDiceIndex + 1;
						}
						diceType = parseInt(dice.substring(dIndex + 1, endDiceIndex));

						var options = dice.substring(endDiceIndex);
						if (options != "") {
							if (options.indexOf("k") != -1 || options.indexOf("K") != -1) {
								endOfDiceNumber = parseInt(options.match(/\d+$/));
								if (endOfDiceNumber < keepDice && endOfDiceNumber >= 0) {
									keepDice = endOfDiceNumber;
								}
							} else {
								keepDice = 1;
							}
							if (options.indexOf("l") != -1 || options.indexOf("L") != -1) {
								keepHigher = false;
							}
						}

						var diceArray = []
						for (var d = 0; d < numDice; d++) {
							diceArray[d] = Math.ceil(Math.random() * diceType);
						}

						if (keepDice < numDice) {
							diceArray = diceArray.sort(function (a, b) { return a - b });
							if (keepHigher) {
								diceArray = diceArray.reverse();
							}
						}

						var total = 0;
						if (numDice > 1) {
							for (var d = 0; d < numDice; d++) {
								if (d < keepDice) {
									displayArray[i] = displayArray[i] + diceArray[d];
									total = total + diceArray[d];
								} else {
									displayArray[i] = displayArray[i] + "~~" + diceArray[d] + "~~" + " 0";
								}
								if (d != numDice - 1) {
									displayArray[i] = displayArray[i] + " + ";
								} else {
									displayArray[i] = displayArray[i] + " ";
								}
							}
							displayArray[i] = displayArray[i] + "= " + total;

						} else if (numDice == 1) {
							total = diceArray[0];
							displayArray[i] = displayArray[i] + total;
						} else {
							total = 0;
							displayArray[i] = displayArray[i] + total;
						}
						displayArray[i] = "(" + displayArray[i] + ")";
						resultArray[i] = total;

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
	}
});




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