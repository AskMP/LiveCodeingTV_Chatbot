(function () {
    "use strict";
    
    var LCTVChatBot,
        Hello = function (data) {
        if (!data) return "returns “world” to the chatroom";
        LCTVChatBot.say("world");
    };
    
    module.exports = function (ChatBot) {
        LCTVChatBot = ChatBot;
        return Hello;
    };    
}());