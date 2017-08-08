var moment = require('moment')
var _ = require('underscore')
const { fixRepeatingGroups } = require('./resources/fixSchema')

var SOHCHAR = exports.SOHCHAR = String.fromCharCode(1);
exports.getUTCTimeStamp = function(){ return moment.utc().format('YYYYMMDD-HH:mm:ss.SSS'); }

var checksum = exports.checksum = function(str){
    var chksm = 0;
    for (var i = 0; i < str.length; i++) {
        chksm += str.charCodeAt(i);
    }

    chksm = chksm % 256;

    var checksumstr = '';
    if (chksm < 10) {
        checksumstr = '00' + (chksm + '');
    }
    else if (chksm >= 10 && chksm < 100) {
        checksumstr = '0' + (chksm + '');
    }
    else {
        checksumstr = '' + (chksm + '');
    }

    return checksumstr;
}

//TODO change name to converMapToFIX
var convertRawToFIX = exports.convertRawToFIX = function(map){
    return convertToFIX(map, map[8], map[52], map[49], map[56], map[34]);
}

var convertToFIX = exports.convertToFIX = function(msgraw, fixVersion, timeStamp, senderCompID, targetCompID, outgoingSeqNum){
    //defensive copy
	var msg = msgraw;
    //for (var tag in msgraw) {
    //    if (msgraw.hasOwnProperty(tag)) msg[tag] = msgraw[tag];
    //}

    delete msg['9']; //bodylength
    delete msg['10']; //checksum

    var headermsgarr = [];
    var bodymsgarr = [];
    //var trailermsgarr = [];

    headermsgarr.push('35=' + msg['35'] , SOHCHAR);
    headermsgarr.push('52=' + timeStamp , SOHCHAR);
    headermsgarr.push('49=' + (msg['49'] || senderCompID) , SOHCHAR);
    headermsgarr.push('56=' + (msg['56'] || targetCompID) , SOHCHAR);
    headermsgarr.push('34=' + outgoingSeqNum , SOHCHAR);

    _.each(msg, (item, tag) => {
        if (['8', '9', '35', '10', '52', '49', '56', '34'].indexOf(tag) === -1 ) {
            if(Array.isArray(item)){
                bodymsgarr.push(tag, '=' , item.length , SOHCHAR)
                item.forEach((group)=>{
                    _.each(group, (item, tag) => {
                        bodymsgarr.push(tag, '=' , item , SOHCHAR)
                    })
                })
            }
            else{
                bodymsgarr.push(tag, '=' , item , SOHCHAR)
            }
        }
    })

    var headermsg = headermsgarr.join('');
    //var trailermsg = trailermsgarr.join('');
    var bodymsg = bodymsgarr.join('');

    var outmsgarr = [];
    outmsgarr.push('8=', msg['8'] || fixVersion, SOHCHAR);
    outmsgarr.push('9=' , (headermsg.length + bodymsg.length) , SOHCHAR);
    outmsgarr.push(headermsg);
    outmsgarr.push(bodymsg);
    //outmsgarr.push(trailermsg);

    var outmsg = outmsgarr.join('');

    outmsg += '10=' + checksum(outmsg) + SOHCHAR;
        
    return outmsg;
}

var convertToMap = exports.convertToMap = function(msg) {
    var fix = {}
    var keyvals = msg.split(SOHCHAR)
        .map((x)=>{ return x.split('=')})

    for(var i = 0; i < keyvals.length; ){
        var pair = keyvals[i]
        if(pair.length === 2){
            var repeatinGroup = fixRepeatingGroups[pair[0]]
            if(!repeatinGroup){
                fix[pair[0]] = pair[1]
                i++
            }
            else{
                var nr = Number(pair[1])
                if(nr){
                    fix[pair[0]] = repeatingGroupToMap(repeatinGroup, nr, keyvals.slice(i+1, i+1 + (nr * repeatinGroup.length)))
                    i += (1 + (nr * repeatinGroup.length))
                }
                else{
                    throw new Error('Repeating Group: "' + pair.join('=') + '" is invalid')
                }
            }
        }
        else
            i++
    }

    return fix;
}

var repeatingGroupToMap = function(repeatinGroup, nr, keyvals){
    var response = []
    for(var i = 0, k = 0; i < nr; i++){
        var group = {}
        
        repeatinGroup.forEach((key)=>{
            if(key === keyvals[k][0])
                group[key] = keyvals[k][1]
            else 
                throw new Error('Repeating Group: "' + JSON.stringify(keyvals) + '" is invalid')

            k++
        })

        response.push(group)
    }
    return response
}