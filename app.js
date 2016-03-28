/*jslint node: true nomen: true*/
var LiveCodingTV = require('node-livecodingtv'),
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
                    var message = "ChatBot welcomes you " + data.who + "!";
                    setTimeout(function () {
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
        
    LiveCodingTV.commands.help = function (data) {
        var description = "Describes all available commands.",
            msg = "\r\n__________________\r\n ChatBot Commands\r\n------------------",
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