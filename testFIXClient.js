//var fix = require("./fix.js");

// var session = fix.createClient("FIX.4.2", "initiator", "acceptor", 1234, "localhost");
// session.connectAndLogon(1234,'localhost');
// /*session.getMessages(function(err, msg){
//     if(err){
//         console.log('Err from data store: '+err);     
//     }
//     else{
//         console.log('Msg from data store: '+JSON.stringify(msg)); 
//     }
// });*/
// session.on("connect", function(){ console.log("EVENT connect"); });
// session.on("end", function(){ console.log("EVENT end"); });
// session.on("logon", function(sender, target){ console.log("EVENT logon: "+ sender + ", " + target); });
// session.on("logoff", function(sender, target){ console.log("EVENT logoff: "+ sender + ", " + target); });
// session.on("incomingmsg", function(msg){ console.log("EVENT incomingmsg: ", msg) });
// session.on("outgoingmsg", function(msg){ console.log("EVENT outgoingmsg: ", msg) });

var {FIXClient, fixutil} = require("./FIXClient.js");

var client = new FIXClient("FIX.4.2", "initiator", "acceptor", { resetSeqNumOnReconect: false })
// var dupa = new FIXClient("FIX.4.2", "dupa", "acceptor", {resetSeqNumOnReconect: false})
// var cipa = new FIXClient("FIX.4.2", "cipa", "acceptor", {resetSeqNumOnReconect: false})


client.connect(1234,'localhost');
// dupa.connect(1234,'localhost');
// cipa.connect(1234,'localhost');

//client.dataIn$.subscribe((response)=>{console.log('dataIn',response)})
client.jsonIn$.subscribe((response)=>{console.log('initiator jsonIn',response)})
client.jsonOut$.subscribe((response)=>{console.log('initiator jsonOut',response)})
client.error$.subscribe((x)=>{console.log(x)})
// dupa.fixIn$.subscribe((response)=>{console.log('dupa fixIn',response)})
// dupa.fixOut$.subscribe((response)=>{console.log('dupa fixOut',response)})
// dupa.error$.subscribe((x)=>{console.log(x)})
// cipa.fixIn$.subscribe((response)=>{console.log('cipa fixIn',response)})
// cipa.fixOut$.subscribe((response)=>{console.log('cipa fixOut',response)})
// cipa.error$.subscribe((x)=>{console.log(x)})