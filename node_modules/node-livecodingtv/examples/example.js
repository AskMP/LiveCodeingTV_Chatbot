/*jslint node: true nomen: true*/
var LiveCodingTV = require('../'),
    ChatBot;

(function () {
    "use strict";
    
    var config = require('./config.json');
    ChatBot = new LiveCodingTV.ChatBot(config);
    ChatBot.connectToServer();
    ChatBot.on('online', function () {
        
        // Once online, join your room
        ChatBot.join(config.jid);

        setTimeout(function () {
            ChatBot.on('join', function (data) {
                if (data.role === "viewer") {
                    var message = "🤖 ChatBot welcomes you " + data.who + "!";
                    if (ChatBot.poll.active && ChatBot.poll.name) {
                        message += "\r\n🗳 We currently have a poll going on called: " + ChatBot.poll.name + "\r\nYou can vote by sending \"!vote:[your answer]\" into chat.";
                        if (ChatBot.poll.options.length > 0) {
                            message += "\r\nOptions are:\r\n" + ChatBot.poll.options.join(", ") + "\r\n";
                        }
                    }
                    setTimeout(function () {
                        // Don’t say hello to bounce viewers
                        if (ChatBot.viewers().indexOf(data.who) !== -1) {
                            ChatBot.say(message);
                        }
                    }, 3000);
                }
            });
        }, 3000);
    });
    
    ChatBot.on('message', function (data) {
        /************************************************
        *   data = {
        *       from: STRING,
        *       role: ["owner"|"moderator"|"viewer"],
        *       message: STRING,
        *       stanza: OBJECT
        *   }
        */
    });
    
    LiveCodingTV.commands.favourite_viewer = function (data) {
        var description = "💖 Gets the current fav viewer. Is it you?";
        if (data) {
            if (data.message.indexOf(':') === -1) {
                if (ChatBot.favourite()) {
                    ChatBot.say('💖 ' + ChatBot.favourite() + ' is currently my fav viewer!');
                } else {
                    ChatBot.say("💖 They’re all my favourite <pfft!>");
                }
            } else if (data.role === "viewer" || data.role === "moderator") {
                if (ChatBot.favourite()) {
                    ChatBot.say('💖 ' + ChatBot.favourite() + ' is currently my fav viewer!');
                } else {
                    ChatBot.say("💖 You’re all my favourite!");
                }
            } else {
                ChatBot.favourite(data.message.substring(data.message.indexOf(':') + 1));
            }
        } else {
            return description;
        }
    };
    
    LiveCodingTV.commands.fav_viewer = LiveCodingTV.commands.favorite_viewer = function (data) {
        if (!data) { return false; }
        LiveCodingTV.commands.favourite_viewer(data);
    };
    
    LiveCodingTV.commands.favourite_music = function (data) {
        var description = "🎵 Really? You need a description of what this does?";
        
        if (data) {
            ChatBot.say("💖 🎵 Most things not country or rap.");
        } else {
            return description;
        }
    };
    
    LiveCodingTV.commands.favorite_music = LiveCodingTV.commands.fav_music = function (data) {
        if (!data) { return false; }
        LiveCodingTV.commands.favourite_music(data);
    };
    
    LiveCodingTV.commands.favourite_ide = function (data) {
        var description = "📝 What I normally code in.";
        
        if (data) {
            ChatBot.say("📝 I generally use Brackets because it forces me to have lint clean code.");
        } else {
            return description;
        }
    };
    
    LiveCodingTV.commands.favorite_ide = LiveCodingTV.commands.fav_ide = function (data) {
        if (!data) { return false; }
        LiveCodingTV.commands.favourite_ide(data);
    };
    
    LiveCodingTV.commands.favourite_language = function (data) {
        var description = "🌐 My favourite language.";
        if (data) {
            ChatBot.say('🌐: ' + ChatBot.owner() + '’s favourite language is the language of love: JavaScript!');
        } else {
            return description;
        }
    };
    
    LiveCodingTV.commands.favorite_language = LiveCodingTV.commands.fav_language = function (data) {
        if (!data) { return false; }
        LiveCodingTV.commands.favourite_language(data);
    };
    
    LiveCodingTV.commands.support = function (data) {
        var description = "📡 Livecoding.tv support URL link";
        if (data) {
            ChatBot.say("📡 http://support.livecoding.tv/hc/en-us/");
        } else {
            return description;
        }
    };
    
    LiveCodingTV.commands.streamingguide = function (data) {
        var description = "📡 Livecoding.tv streaming guide link";
        if (data) {
            ChatBot.say("📡 https://www.livecoding.tv/streamingguide/");
        } else {
            return description;
        }
    };
        
    LiveCodingTV.commands.help = function (data) {
        var description = "🤖 Describes all available commands.",
            msg = "\r\n__________________\r\n 🤖 ChatBot Commands\r\n------------------",
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
    
    // Commands that return false when there is no data passed will not show up in the list of commands available
    // but can still be run. As an example, you can use “!chatbot” as you would “!help” but it doesn’t show up in
    // the list of available commands
    LiveCodingTV.commands.chatbot = function (data) {
        if (!data) { return false; }
        LiveCodingTV.commands.help(data);
    };
    
}());