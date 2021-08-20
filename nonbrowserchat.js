/*
 *    SIMPLE NON-BROWSER BASED ECE CHAT
 * 
 *    Anonymous chat with no data passing, just enough to prove the mechanism before
 *    adding real chat clients.
 *    Chat input/output is via terminal window.
 */

var readline = require('readline');
var window = require('node-strophe').Strophe;
Strophe = window.Strophe;
$build = window.$build;
$msg = window.$msg;

XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
jQuery = require('./static/jquery-2.1.3.min.js');
require('./static/egain-client-library.0.0.25.dev.pt.strophefix');

jQuery.support.cors = true;

// Initialise ECE SDK ---------------------------------------------------------

var librarySettings = new window.eGainLibrarySettings();
librarySettings.CORSHost = 'https://eceserver.ngrok.io/system';
librarySettings.IsDevelopmentModeOn = false;
librarySettings.eGainContextPath = librarySettings.CORSHost + '/templates/chat/aqua/';
librarySettings.ChatPauseInSec = '30';
librarySettings.IsDebugOn = false;

var myLibrary = new window.eGainLibrary(librarySettings);
var myChat = new myLibrary.Chat();
var myEventHandlers = myChat.GetEventHandlers();


// Define event handlers ------------------------------------------------------

myEventHandlers.OnConnectSuccess =
      function () {
            console.log('*** Chat Started');

            var rl = readline.createInterface(process.stdin, process.stdout);
            rl.setPrompt('Me> ');
            rl.prompt();
            rl.on('line', function (line) {
                  myChat.SendMessageToAgent(line);
                  rl.prompt();
            }).on('close', function () {
                  console.log('*** Exiting');
                  myChat.End();
            });
      };

myEventHandlers.OnConnectionFailure = function (ev) {
      console.log('*** Connection failed: ' + ev.StatusMessage);
      process.exit();
};

myEventHandlers.OnErrorOccurred = function () { console.log('*** Error occurred'); };

myEventHandlers.OnAgentMessageReceived = function (agentMessageReceivedEventArgs) {
      console.log('Agent> ' + agentMessageReceivedEventArgs.Message);
};

myEventHandlers.OnSystemMessageReceived = function (systemMessageReceivedEventArgs) {
      console.log('*** System Message: ' + systemMessageReceivedEventArgs.Message);
};

myEventHandlers.OnAgentsNotAvailable = function (agentsNotAvailableEventArgs) {
      console.log('Sorry no agents available');
};

myEventHandlers.OnConnectionComplete = function () {
      console.log('*** Chat completed');
      process.exit();
};

myEventHandlers.OnConnectionInitialized = function (initData) {
//      console.log('*** Chat initialised', initData);
      console.log('*** Chat initialised');

      myLibrary.SetXEgainSession('undefined');
      myLibrary.SetCustomer(new myLibrary.Datatype.CustomerObject());
      console.log('*** Starting chat ...');

      myChat.Start();
};


// Kick-off the chat by initialising ------------------------------------------

console.log('*** Initialising');
myChat.Initialize('1003', 'en', 'US', myEventHandlers, 'aqua', 'v11');
