/*jslint node: true*/
var LiveCodingTV = require('node-livecodingtv'),
    ChatBot;

(function () {
    "use strict";
    
    // Add Mopidy Support!
    // Lotto tickets for persistent and long term viewers?
    
    ChatBot = new LiveCodingTV.ChatBot((require('./config.json')));
    ChatBot.connectToServer();
    ChatBot.on('online', function () {
        ChatBot.join('askmp');
        setTimeout(function () {
            ChatBot.on('join', function (data) {
                if (data.roll === "viewer") {
                    var message = "ChatBot welcomes you " + data.who + "!";
                    if (ChatBot.poll.active && ChatBot.poll.name) {
                        message += "\r\nWe currently have a poll going on called: " + ChatBot.poll.name + "\r\nYou can vote by sending \"!vote:[your answer]\" into chat.";
                        if (ChatBot.poll.options.length > 0) {
                            message += "\r\nOptions are:\r\n" + ChatBot.poll.options.join(", ") + "\r\n";
                        }
                    }
                    setTimeout(function () {
                        ChatBot.say(message);
                    }, 4000);
                }
            });
        }, 3000);
    });
    
    ChatBot.on('message', function (data) {
        /************************************************
        *   data = {
        *       from: STRING,
        *       roll: ["owner"|"moderator"|"viewer"],
        *       message: STRING,
        *       stanza: OBJECT
        *   }
        */
    });
    
    LiveCodingTV.commands.newContest = function (data) {
        if (!data || data.roll !== "owner") { return false; }
        
        ChatBot.contest = {
            entries: [],
            active : true
        };
        
        ChatBot.say("New contest has begun, enter by writing in chat:\r\n\"!enter\"\r\n");
    };
    
    LiveCodingTV.commands.closeContest = function (data) {
        if (!data || data.roll !== "owner") { return false; }
        
        ChatBot.contest.active = false;
        
        
        ChatBot.say("Contest has ended, thank you to all of the people who submitted.\r\n");
    };
    
    LiveCodingTV.commands.contestWinner = function (data) {
        if (!data || data.roll !== "owner") { return false; }
        var winnerIndex = Math.floor(Math.random() * ChatBot.contest.entries.length);
        ChatBot.say("And the winner is…");
        ChatBot.say(ChatBot.contest.entries[winnerIndex] + "! Please send a message to " + ChatBot.owner());
    };
    
    LiveCodingTV.commands.enter = function (data) {
        if (!data) { return "Enter any contest that is currently going on."; }
        if (!ChatBot.contest.active) {
            return;
        }
        if (ChatBot.contest.entries.indexOf(data.from) !== -1) {
            return;
        }
        ChatBot.contest.entries.push(data.from);
    };
    
    LiveCodingTV.commands.newPoll = LiveCodingTV.commands.newVote = function (data) {
        if (!data || data.roll !== "owner") { return false; }
        
        ChatBot.poll = {
            name : false,
            options : [],
            active : true,
            voters : [],
            votes : {}
        };
        
        if (data.message.indexOf(':') !== -1) {
            ChatBot.poll.name = data.message.substring(data.message.indexOf(':') + 1);
            if (ChatBot.poll.name.indexOf('[') !== -1) {
                ChatBot.poll.options = ChatBot.poll.name.split('[')[1].replace(']', '').replace(', ', ',').split(',');
                ChatBot.poll.name = ChatBot.poll.name.substring(0, ChatBot.poll.name.indexOf('['));
            }
        }
        var message = "\r\nWe currently have a poll going on called: " + ChatBot.poll.name + "\r\nYou can vote by sending \"!vote:[your answer]\" into chat.";
        if (ChatBot.poll.options.length > 0) {
            message += "\r\nOptions are:\r\n" + ChatBot.poll.options.join(", ") + "\r\n";
        }
        ChatBot.say(message);
    };
    
    LiveCodingTV.commands.pollResults = LiveCodingTV.commands.votingResults = function (data) {
        if (!data || data.roll !== "owner") { return false; }
        var votes = Object.keys(ChatBot.poll.votes),
            results = "Voting Results:";
        votes.forEach(function (v) {
            results += "\r\n" + v + ": " + ChatBot.poll.votes[v];
        });
        
        ChatBot.say(results);
        
    };
    
    LiveCodingTV.commands.pollClose = LiveCodingTV.commands.votingClose = function (data) {
        if (!data || data.roll !== "owner") { return false; }
        
        ChatBot.poll.active = false;
        ChatBot.say('Voting is closed, stay tuned for the results');
    };
    
    LiveCodingTV.commands.pollOpen = LiveCodingTV.commands.votingOpen = function (data) {
        if (!data || data.roll !== "owner") { return false; }
        
        ChatBot.poll.active = true;
        if (ChatBot.poll.name) {
            var message = "\r\nWe currently have a poll going on called: " + ChatBot.poll.name + "\r\nYou can vote by sending \"!vote:[your answer]\" into chat.";
            if (ChatBot.poll.options.length > 0) {
                message += "\r\nOptions are:\r\n" + ChatBot.poll.options.join(", ") + "\r\n";
            }
            ChatBot.say(message);
        }
    };
    
    LiveCodingTV.commands.vote = function (data) {
        if (!data) { return "Voting platform for quick one-off surveys"; }
        if (data.message.indexOf(':') === -1) { return null; }

        if (!ChatBot.poll.active) {
            ChatBot.say('Sorry, the poll is currently closed');
            return;
        }

        if (ChatBot.poll.voters.indexOf(data.from) !== -1) {
            return;
        }

        ChatBot.poll.voters.push(data.from);
        var vote = data.message.substring(data.message.indexOf(':') + 1).toLowerCase();
        if (!ChatBot.poll.votes[vote]) {
            if (ChatBot.poll.options.indexOf(vote) === -1) {
                ChatBot.poll.options.push(vote);
            }
            ChatBot.poll.votes[vote] = 0;
        }

        ChatBot.poll.votes[vote] += 1;
    };
    
    LiveCodingTV.commands.favourite_viewer = LiveCodingTV.commands.favorite_viewer = LiveCodingTV.commands.fav_viewer = function (data) {
        var description = "Gets the current fav viewer. Is it you?";
        if (data) {
            if (data.message.indexOf(':') === -1) {
                if (ChatBot.favourite()) {
                    ChatBot.say(ChatBot.favourite() + ' is currently my fav viewer!');
                } else {
                    ChatBot.say("They’re all my favourite <pfft!>");
                }
            } else if (data.roll === "viewer" || data.roll === "moderator") {
                if (ChatBot.favourite()) {
                    ChatBot.say(ChatBot.favourite() + ' is currently my fav viewer!');
                } else {
                    ChatBot.say("You’re all my favourite!");
                }
            } else {
                ChatBot.favourite(data.message.substring(data.message.indexOf(':') + 1));
            }
        } else {
            return description;
        }
    };
    
    LiveCodingTV.commands.favorite_music = LiveCodingTV.commands.favourite_music = function (data) {
        var description = "Really? You need a description of what this does?";
        
        if (data) {
            ChatBot.say("Most things not country or rap.");
        } else {
            return description;
        }
    };
    
    LiveCodingTV.commands.favorite_ide = LiveCodingTV.commands.favourite_ide = function (data) {
        var description = "What I normally code in.";
        
        if (data) {
            ChatBot.say("I generally use Brackets because it forces me to have lint clean code.");
        } else {
            return description;
        }
    };
    
    LiveCodingTV.commands.favorite_language = LiveCodingTV.commands.favourite_language = function (data) {
        var description = "My favourite language.";
        if (data) {
            ChatBot.say(ChatBot.owner() + '’s favourite language is the language of love, aka JavaScript!');
        } else {
            return description;
        }
    };
    
    LiveCodingTV.commands.support = function (data) {
        var description = "Livecoding.tv support URL link";
        if (data) {
            ChatBot.say("http://support.livecoding.tv/hc/en-us/");
        } else {
            return description;
        }
    };
    
    LiveCodingTV.commands.streamingguide = function (data) {
        var description = "Livecoding.tv streaming guide link";
        if (data) {
            ChatBot.say("https://www.livecoding.tv/streamingguide/");
        } else {
            return description;
        }
    };
        
    LiveCodingTV.commands.chatbot = LiveCodingTV.commands.help = function (data) {
        var description = "Describes all available commands.",
            msg = "**** ChatBot Commands ****",
            keys = Object.keys(LiveCodingTV.commands),
            desc;
        if (data) {
            keys.forEach(function (cmd) {
                desc = LiveCodingTV.commands[cmd]();
                msg += (desc) ? "\r\n!" + cmd + ": " + desc : "";
            });
            ChatBot.say(msg);
        } else {
            return description;
        }
    };
    
    LiveCodingTV.commands.repeat = function (data) {
        var msg, description = "Repeat what the viewer has said. If a colon (':') exists, only repeat what is after the colon.";
        if (data) {
            msg = (data.message.indexOf(':') === -1) ? data.message : data.message.substring(data.message.indexOf(':') + 1);
            ChatBot.say(msg);
        } else {
            return description;
        }
    };
    
}());