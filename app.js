//express web server variables
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

//Twilio variables

const accountSid = "";
const authToken = ""
const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

//defined variables
var fst_msg = "";
var cust_phone_no="";
var res_obj;
var req_obj;

//express web server methods
/*app.get('/ecetransfer', (req, res)=>
{
    myChat.Initialize('1001', 'en', 'US', myEventHandlers, 'aqua', 'v11');
    fst_msg = req.query.msg_from_twilio;
    cust_phone_no = req.query.phone_number;
    console.log(fst_msg);
    console.log(cust_phone_no);
    res_obj = res;
});

app.get('/sendtoagent', (req, res)=>{
    res_obj = null;
    myChat.SendMessageToAgent(req.query.msg_from_twilio);
    res_obj = res;
});*/

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'secret'}));

app.post('/ece', (req, res) => {

    res_obj = res;
    req_obj = req;

    cust_phone_no = req.body.WaId;
    if(req.session.started)
    {
        cust_message = req.body.Body;
        myChat.SendMessageToAgent(cust_message);
    }
    else{
        req.session.started = true;
        myChat.Initialize('1001', 'en', 'US', myEventHandlers, 'aqua', 'v11');
        const twiml = new MessagingResponse();

        twiml.message("Bem-vindo ao ambiente Wittel Cisco V 11.x \nComo posso ser útil?");

        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
    }
    //
    //console.log(req);
});

http.createServer(app).listen(3000, () => {
  console.log('Express server listening on port 3000');
});


/*app.listen(port, ()=>{
    console.log('listening');
});*/

//eGain integration logic

//eGain Cisco variables and needed modules

var window = require("./static/strophe.js").Strophe;
Strophe = window.Strophe;
$build = window.$build;
$msg = window.$msg;

XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

jQuery = require('./static/jquery-2.1.3.min.js');
require('./static/egain-client-library.0.0.25.dev.pt.strophefix');

jQuery.support.cors = true;

var librarySettings = new window.eGainLibrarySettings();
librarySettings.CORSHost = 'http://eceserver.ngrok.io/system';
librarySettings.eGainContextPath = librarySettings.CORSHost + '/templates/chat/aqua/';
librarySettings.ChatPauseInSec = '30';
librarySettings.IsDebugOn = false;

var myLibrary = new window.eGainLibrary(librarySettings);
var myChat = new myLibrary.Chat();
var myEventHandlers = myChat.GetEventHandlers();

    myEventHandlers.OnConnectSuccess =
        function () {
                console.log('*** Chat Started');

        };

    myEventHandlers.OnConnectionFailure = function (ev) {
        console.log('*** Connection failed: ' + ev.StatusMessage);
        console.log(ev);
        process.exit();
    };

    myEventHandlers.OnErrorOccurred = function () { console.log('*** Error occurred'); };

    myEventHandlers.OnAgentMessageReceived = function (agentMessageReceivedEventArgs) {
        console.log('Agent> ' + agentMessageReceivedEventArgs.Message);
        //from whatsapp sandbox number

        console.log(cust_phone_no);
        var phone_to_send = 'whatsapp:+'+cust_phone_no;
        console.log(phone_to_send);

        client.messages
            .create({
                from: 'whatsapp:+14155238886',
                body: agentMessageReceivedEventArgs.Message,
                to: phone_to_send
            })
            .then(message => console.log(message.sid));

            //o operador tem que esperar a primeira mensagem do cliente pois o objeto RES 'e destruido fechado depois de enviado a msg

            /*const twiml = new MessagingResponse();

            twiml.message(agentMessageReceivedEventArgs.Message);

            res_obj.writeHead(200, {'Content-Type': 'text/xml'});
            res_obj.end(twiml.toString());*/
    };

    myEventHandlers.OnSystemMessageReceived = function (systemMessageReceivedEventArgs) {
        console.log('*** System Message: ' + systemMessageReceivedEventArgs.Message);
    };

    myEventHandlers.OnAgentsNotAvailable = function (agentsNotAvailableEventArgs) {
        console.log('Sorry no agents available');
    };

    myEventHandlers.OnConnectionComplete = function () {
        console.log('*** Chat completed');
        var phone_to_send = 'whatsapp:+'+cust_phone_no;
        console.log(phone_to_send);

        client.messages
            .create({
                from: 'whatsapp:+14155238886',
                body: "Obrigado pelo seu contato!\nMe chame sempre que precisar! 😉",
                to: phone_to_send
            })
            .then(message => console.log(message.sid));
        req_obj.session.destroy();
    };

    myEventHandlers.OnConnectionInitialized = function (initData) {
    //      console.log('*** Chat initialised', initData);
        console.log('*** Chat initialised');

        myLibrary.SetXEgainSession('undefined');
        myLibrary.SetCustomer(new myLibrary.Datatype.CustomerObject());
        console.log('*** Starting chat ...');
        
        myChat.Start();
    };
