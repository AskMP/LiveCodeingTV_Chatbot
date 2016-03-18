/*jslint node: true es5: true nomen: true*/
/*globals Promise*/
(function () {
    "use strict";
    
    var LiveCodingTV = {
        commands : {},
        ChatBot : require('./livecodingtv.chatbot')
    };
    
    module.exports = LiveCodingTV;
    
}());