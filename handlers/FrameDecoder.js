var fixutil = require('../fixutils.js');
var util = require('util');
var { Observable } = require('rx')

//static vars
var SOHCHAR = String.fromCharCode(1);
var ENDOFTAG8 = 10;
var STARTOFTAG9VAL = ENDOFTAG8 + 2;
var SIZEOFTAG10 = 8;

exports.FrameDecoder = function($){
    this.buffer = '';
    var self = this;

    this.decode = (data) => {
		self.buffer = self.buffer + data;
		var messages = []

        while (self.buffer.length > 0) {
            //====================================Step 1: Extract complete FIX message====================================

            //If we don't have enough data to start extracting body length, wait for more data
            if (self.buffer.length <= ENDOFTAG8) {
                return;
            }

            var _idxOfEndOfTag9Str = self.buffer.substring(ENDOFTAG8).indexOf(SOHCHAR);
            var idxOfEndOfTag9 = parseInt(_idxOfEndOfTag9Str, 10) + ENDOFTAG8;

            if (isNaN(idxOfEndOfTag9)) {
                var error = '[ERROR] Unable to find the location of the end of tag 9. Message probably malformed: '
                    + self.buffer.toString();
                throw new Error(error)
            }


            //If we don't have enough data to stop extracting body length AND we have received a lot of data
            //then perhaps there is a problem with how the message is formatted and the session should be killed
            if (idxOfEndOfTag9 < 0 && self.buffer.length > 100) {
                var error ='[ERROR] Over 100 character received but body length still not extractable.  Message malformed: '
                    + databuffer.toString();
                throw new Error(error)
            }


            //If we don't have enough data to stop extracting body length, wait for more data
            if (idxOfEndOfTag9 < 0) {
                return Observable.empty()
            }

            var _bodyLengthStr = self.buffer.substring(STARTOFTAG9VAL, idxOfEndOfTag9);
            var bodyLength = parseInt(_bodyLengthStr, 10);
            if (isNaN(bodyLength)) {
                var error = "[ERROR] Unable to parse bodyLength field. Message probably malformed: bodyLength='"
                    + _bodyLengthStr + "', msg=" + self.buffer.toString()
                throw new Error(error)
            }

            var msgLength = bodyLength + idxOfEndOfTag9 + SIZEOFTAG10;

            //If we don't have enough data for the whole message, wait for more data
            if (self.buffer.length < msgLength) {
                return Observable.empty()
            }

            //Message received!
            var msg = self.buffer.substring(0, msgLength);
            if (msgLength == self.buffer.length) {
                self.buffer = '';
            }
            else {
                var remainingBuffer = self.buffer.substring(msgLength);
                self.buffer = remainingBuffer;
            }
            
            //====================================Step 2: Validate message====================================

            var calculatedChecksum = fixutil.checksum(msg.substr(0, msg.length - 7));
            var extractedChecksum = msg.substr(msg.length - 4, 3);

            if (calculatedChecksum !== extractedChecksum) {
                var error = '[WARNING] Discarding message because body length or checksum are wrong (expected checksum: '
                    + calculatedChecksum + ', received checksum: ' + extractedChecksum + '): [' + msg + ']'
                throw new Error(error)
            }

			messages.push(msg)
			//return msg
		}
		return Observable.fromArray(messages)
    }
}
