(function () {
    "use strict";
    
    var LCTVChatBot,
        Say = function (data) {
        if (!data) return "Dummy chatbot say what?";
        if (data.from === LCTVChatBot.me()) return;
        if (data.message.indexOf(":") != 0) {
            LCTVChatBot.say(data.message.substring(data.message.indexOf(":") + 1));
        } else {
            LCTVChatBot.say("You can’t make me.");
        }
    };
    
    module.exports = function (ChatBot) {
        LCTVChatBot = ChatBot;
        return Say;
    };    
}());