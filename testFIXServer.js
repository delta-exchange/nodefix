var fix = require('./fix.js');
var {FIXServer} = require("./FIXServer.js");

var server = new FIXServer({resetSeqNumOnReconect: false})
server.jsonIn$.subscribe((x)=>{if(x.msg.GapFillFlag != 'Y') console.log('jsonIn', x)})
server.jsonOut$.subscribe((x)=>{if(x.msg.GapFillFlag != 'Y') console.log('jsonOut', x)})
server.error$.subscribe((x)=>{console.log(x)})
server.listen(1234, "localhost")
// client.connectAndLogon(1234,'localhost');
// fix.createServer({},function(session){
//     console.log("EVENT connect");
//     session.on("end", function(sender,target){ console.log("EVENT end"); });
//     session.on("logon", function(sender, target){ console.log("EVENT logon: "+ sender + ", " + target); });
//     session.on("incomingmsg", function(msg){ console.log("EVENT incomingmsg: ", msg); });
//     session.on("outgoingmsg", function(msg){ console.log("EVENT outgoingmsg: ", msg); });

// }).listen(1234, "localhost");

