/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	var IndexCompressor = function(buffer, bufsize) {

		var VDSINDEXCOMPRESSOR_MAX_PREV_VALS = 32;
		var VDSINDEXCOMPRESSOR_MAX_PREV_DELTAS = 16;
		// var VDSINDEXCOMPRESSOR_MAX_UINT32_BYTECOUNT = 5;

		// commands (4 bits)
		// var RANGE_IN_DELTA_I4 = 8; // File sizes after zlib compression with different RANGE_IN_DeltaI4: 2=1795363, 3=1795064, 4=1795264, 5=1795492, 6=1795864, 7=1796063, 8=1796330. Note: .rh format uses '3'

		//
		// less than 1 byte commands (batch)
		//
		// #define COMMAND_MULTIPLE_DELTA_I4     2//4,6,8, ..34 x 4-bit deltas [3..18 bytes] -- $ToDo: we can still add this command!
		// #define COMMAND_MULTIPLE_DELTA_I4     2//4,5,6, ..19 x 4-bit deltas [3..11 bytes]
		var COMMAND_BACKPTR_VLAUE_U22 = 13; // 2 2-bit backValues in 1 byte (having 3 backvalues in 2 bytes is controversial, gives max=3Kb on 2.9Mb)
		var COMMAND_REPLICATE = 14; // 3..18 equal values - used only after COMMAND_BackPtrValueU22(0,0)
		//
		// 1 byte commands
		//
		var COMMAND_BACKPTR_VALUE_U4_1 = 0; // val=prev(0..15) (equalVal==previousVal should be written as COMMAND_BackPtrValueU4_1(0))
		var COMMAND_DELTA_I4 = 1; // val+=(1..8 [but less range is used for better compression=RANGE_IN_DeltaI4]) -- (using 1..16 range gives much worse compression). Having COMMAND_DeltaI22 gives worse compr
		var COMMAND_DELTA_U4_POSITIVE_V = 3; // !!! val=PrevVertical+(1..16) -- difference - 28965
		var COMMAND_DELTA_U4_NEGATIVE_V = 4; // !!! val=PrevVertical-(1..16) -- (2949219 -> 2900254 all positive)
		var COMMAND_BACKPTR_VALUE_U4_2 = 5; // !!! val=prev(16..31) -- controversial! win 5kb on 4 small 573Kb files, but loose 4kb on a single 2.3Mb file (?remove?)
		var COMMAND_BACKPTR_DELTA_U4 = 6; // !!! val+=prevdelta(0..15) -- controversial! loose 80-100 bytes on some files, win same amount on others. also having (16..31) ptrs gives even worse compression + 2kb on 2.9Mb (?remove?)
		var COMMAND_DELTA_U4_POSITIVE_V2 = 7; // !!! val=PrevVertical+(17..32) -- doesn't give big difference - 3635. Having COMMAND_DeltaU12PositiveV doesn't give improvement (win sometimes), but mostly loose 3kb
		var COMMAND_DELTA_U4_NEGATIVE_V2 = 8; // !!! val=PrevVertical-(17..32) -- (2900254 -> 2896619 all positive)
		//
		// 2 byte commands
		//
		var COMMAND_DELTA_U12_POSITIVE = 9; // !!! val+=(3..4099) [2 bytes]
		var COMMAND_DELTA_U12_NEGATIVE = 10; // !!! val+=(3..4099) [2 bytes]
		var COMMAND_VALUE_U12 = 11; // 4096 values [2 bytes]
		//
		// 3 byte commands
		//
		var COMMAND_VALUE_U20 = 12; // 1048576 values [3 bytes]
		//
		// extended commands
		//
		var COMMAND_EXTENDED = 15; // [1/3/4/5 byte(s)], see EXTENDED_COMMAND_TYPE_XXX
		var EXTENDED_COMMAND_EQ_00000000 = 0; // [1 byte]
		var EXTENDED_COMMAND_EQ_00000001 = 1; // [1 byte]
		var EXTENDED_COMMAND_EQ_00000002 = 2; // [1 byte]
		var EXTENDED_COMMAND_EQ_00000003 = 3; // [1 byte]
		var EXTENDED_COMMAND_EQ_00000004 = 4; // [1 byte]
		var EXTENDED_COMMAND_EQ_000000FF = 5; // [1 byte]
		var EXTENDED_COMMAND_EQ_0000FF00 = 6; // [1 byte]
		var EXTENDED_COMMAND_EQ_00FF0000 = 7; // [1 byte]
		var EXTENDED_COMMAND_EQ_FF000000 = 8; // [1 byte]
		var EXTENDED_COMMAND_EQ_00FFFFFF = 9; // [1 byte]
		var EXTENDED_COMMAND_EQ_FFFFFFFF = 10; // [1 byte]
		var EXTENDED_COMMAND_VALUE_U24 = 11; // [4 bytes]
		var EXTENDED_COMMAND_VALUE_U32 = 12; // [5 bytes] (worst case scenario [very low probability])
		var EXTENDED_COMMAND_LONG_REPLICATE_16 = 13; // [3 bytes] [37..(37+65535==65572)] - 36 repeats should be 2 x (COMMAND_Replicate(18))
		// var EXTENDED_COMMAND_RESERVED_XXX_2 = 14; // this command should never be encountered
		// var EXTENDED_COMMAND_RESERVED_XXX_3 = 15; // this command should never be encountered

		var DEFAULT_PREV_VAL = 4294967295;

		var InValueQueue = 0;
		this.rvalue = 0;
		var queueval = 0;
		var pBuffer = buffer;
		var uBufSize = bufsize;
		var uCurByte = 0;

		var PrevVals = new Array(VDSINDEXCOMPRESSOR_MAX_PREV_VALS);
		var PrevDeltas = new Array(VDSINDEXCOMPRESSOR_MAX_PREV_DELTAS);

		var CurValPos = VDSINDEXCOMPRESSOR_MAX_PREV_VALS - 1;
		var CurDltPos = VDSINDEXCOMPRESSOR_MAX_PREV_DELTAS - 1;

		var overflow = false;

		this.Reset = function() {
			InValueQueue = 0;
			this.rvalue = 0;
			queueval = 0;
			uCurByte = 0;

			var j;
			for (j = 0; j < VDSINDEXCOMPRESSOR_MAX_PREV_VALS; j++) {
				PrevVals[j] = VDSINDEXCOMPRESSOR_MAX_PREV_VALS - j - 1; // init to 0, 1, 2, 3... (decoder can have longer MAX_PREVVALS, it'll be compatible)
			}

			for (j = 0; j < VDSINDEXCOMPRESSOR_MAX_PREV_DELTAS; j++) {
				PrevDeltas[j] = 1; // init to all ones, best suitable for (0,1,2),(3,4,5),(6,7,8)
			}

			CurValPos = VDSINDEXCOMPRESSOR_MAX_PREV_VALS - 1;
			CurDltPos = VDSINDEXCOMPRESSOR_MAX_PREV_DELTAS - 1;
		};

		this.Reset();

		function GetBackValue(which) {
			return PrevVals[(CurValPos >= which) ? (CurValPos - which) : (VDSINDEXCOMPRESSOR_MAX_PREV_VALS + CurValPos - which)];
		}

		function GetBackDelta(which) {
			return PrevDeltas[(CurDltPos >= which) ? (CurDltPos - which) : (VDSINDEXCOMPRESSOR_MAX_PREV_DELTAS + CurDltPos - which)];
		}

		function AddBackValue(value) {
			// console.log("AddBackValue " + value);
			CurValPos++;
			if (CurValPos >= VDSINDEXCOMPRESSOR_MAX_PREV_VALS) {
				CurValPos = 0;
			}

			PrevVals[CurValPos] = value;
		}

		function AddBackDelta(value) {
			// console.log("AddBackDelta " + value);
			CurDltPos++;
			if (CurDltPos >= VDSINDEXCOMPRESSOR_MAX_PREV_DELTAS) {
				CurDltPos = 0;
			}

			PrevDeltas[CurDltPos] = value;
		}

		function ReadU8() {
			// console.log("reading u8 overflow=" + overflow);
			// console.log("uCurByte " + uCurByte);
			// console.log("uBufSize " + uBufSize);
			// console.log("pBuffer[uCurByte++]" + pBuffer[uCurByte++]);
			if (uCurByte < uBufSize) {
				return pBuffer[uCurByte++];
			}

			// console.log("*** overflow");
			overflow = true;
			return 0;
		}

		function ReadU16() {
			return ReadU8() + ReadU8() * 256;
		}

		function ReadU32() {
			return ReadU8() + ReadU8() * 256 + ReadU8() * 65536 + ReadU8() * 16777216;
		}

		this.ReadCommand = function(prevVertical) {

			if (prevVertical === undefined) {
				prevVertical = DEFAULT_PREV_VAL;
			}

			overflow = false;
			var prevval = this.rvalue;

			if (InValueQueue) {
				// console.log("*** get_value_from_queue");
				// console.log("queueval " + queueval);
				InValueQueue--;
				this.rvalue = GetBackValue(queueval);
			} else {
				// command
				var cmd = ReadU8(); // together with the operand
				// console.log("ReadU8 returned " + cmd);
				if (overflow) {
					// just use a "harmless" case value
					cmd = COMMAND_DELTA_I4;
					// console.log("*** *** overflow");
				}

				// console.log("command " + (cmd & 0xF));
				var cmdshift4 = cmd >>> 4;
				// console.log("operand is " + cmdshift4);
				switch (cmd & 0xF) {
					case COMMAND_BACKPTR_VALUE_U4_1:
						// console.log("*** COMMAND_BackPtrValueU4_1");
						this.rvalue = GetBackValue(cmdshift4);
						break;
					case COMMAND_BACKPTR_VALUE_U4_2:
						// console.log("*** COMMAND_BackPtrValueU4_2");
						this.rvalue = GetBackValue(16 + cmdshift4);
						break;
					case COMMAND_BACKPTR_VLAUE_U22:
						// console.log("*** COMMAND_BackPtrValueU22");
						this.rvalue = GetBackValue(cmdshift4 >>> 2);
						queueval = cmdshift4 & 3;
						InValueQueue = 1;
						break;
					case COMMAND_REPLICATE:
						// console.log("*** COMMAND_Replicate");
						this.rvalue = GetBackValue(0);
						queueval = 0;
						InValueQueue = cmdshift4 + 2;
						break;
					case COMMAND_BACKPTR_DELTA_U4:
						// console.log("*** COMMAND_BackPtrDeltaU4");
						this.rvalue += GetBackDelta(cmdshift4);
						break;
					case COMMAND_DELTA_I4:
						// console.log("*** COMMAND_DeltaI4");
						// console.log("rvalue before delta " + this.rvalue);
						if (cmd & 16) {
							this.rvalue += (cmd >>> 5) + 1;
						} else {
							this.rvalue -= (cmd >>> 5) + 1;
						}
						// console.log("rvalue after delta " + this.rvalue);
						break;
					/* case COMMAND_Multiple_DeltaI4:
					{
					UINT32 nvals=cmdshift4+4;
					InDeltaQueue=nvals-1;
					nvals=nvals/2 + nvals%2;
					for(UINT32 i=0;i<nvals;i++)
					{
					UINT8 x=ReadU8();
					if(!i)
					rvalue+=(INT32)(x>>4) - 7;
					else
					queue[InDeltaQueue-2-(i*2)+2]=x>>4;
					queue[InDeltaQueue-2-(i*2-1)]=x&0xF;
					}
					//InDeltaQueue--;
					}
					break;*/
					case COMMAND_DELTA_U4_POSITIVE_V:
						// console.log("*** COMMAND_DeltaU4Positive_V");
						this.rvalue = prevVertical + (cmdshift4 + 1);
						break;
					case COMMAND_DELTA_U4_NEGATIVE_V:
						// console.log("*** COMMAND_DeltaU4Negative_V");
						this.rvalue = prevVertical - (cmdshift4 + 1);
						break;
					case COMMAND_DELTA_U4_POSITIVE_V2:
						// console.log("*** COMMAND_DeltaU4Positive_V2");
						this.rvalue = prevVertical + (cmdshift4 + 17);
						break;
					case COMMAND_DELTA_U4_NEGATIVE_V2:
						// console.log("*** COMMAND_DeltaU4Negative_V2");
						this.rvalue = prevVertical - (cmdshift4 + 17);
						break;
					case COMMAND_DELTA_U12_POSITIVE:
						// console.log("*** COMMAND_DeltaU12Positive");
						this.rvalue += cmdshift4 + ((ReadU8()) << 4) + 3;
						break;
					case COMMAND_DELTA_U12_NEGATIVE:
						// console.log("*** COMMAND_DeltaU12Negative");
						this.rvalue -= cmdshift4 + ((ReadU8()) << 4) + 3;
						break;
					case COMMAND_VALUE_U12:
						// console.log("*** COMMAND_ValueU12");
						this.rvalue = cmdshift4 + ((ReadU8()) << 4);
						break;
					case COMMAND_VALUE_U20:
						// console.log("*** COMMAND_ValueU20");
						// console.log("rvalue before value u20 " + this.rvalue);
						// console.log("cmdshift " + cmdshift4);
						// console.log("bOverflow " + bOverflow);
						var data = ReadU16();
						// console.log("data " + data);
						this.rvalue = cmdshift4 + (data << 4);
						// console.log("rvalue after value u20 " + this.rvalue);
						break;
					case COMMAND_EXTENDED:
						switch (cmd >>> 4) {
							case EXTENDED_COMMAND_EQ_00000000:
							case EXTENDED_COMMAND_EQ_00000001:
							case EXTENDED_COMMAND_EQ_00000002:
							case EXTENDED_COMMAND_EQ_00000003:
							case EXTENDED_COMMAND_EQ_00000004:
								this.rvalue = cmd >>> 4;
								break;
							case EXTENDED_COMMAND_EQ_000000FF:
								this.rvalue = 0x000000FF;
								break;
							case EXTENDED_COMMAND_EQ_0000FF00:
								this.rvalue = 0x0000FF00;
								break;
							case EXTENDED_COMMAND_EQ_00FF0000:
								this.rvalue = 0x00FF0000;
								break;
							case EXTENDED_COMMAND_EQ_FF000000:
								this.rvalue = 0xFF000000;
								break;
							case EXTENDED_COMMAND_EQ_00FFFFFF:
								this.rvalue = 0x00FFFFFF;
								break;
							case EXTENDED_COMMAND_EQ_FFFFFFFF:
								this.rvalue = 0xFFFFFFFF;
								break;
							case EXTENDED_COMMAND_LONG_REPLICATE_16:
								queueval = 0;
								InValueQueue = ReadU16() + 36;
								break;
							case EXTENDED_COMMAND_VALUE_U24:
								{
									var bl = ReadU8();
									this.rvalue = (ReadU16() << 8) + bl;
								}
								break;
							case EXTENDED_COMMAND_VALUE_U32:
								this.rvalue = ReadU32();
								break;
							default:
								return false;
							// assert(false && "not yet");
						}
						break;

					default:
						return false;
					// assert(false && "not yet");
				}
			}

			if (this.rvalue > 0xFFFFFFFF) {
				this.rvalue = this.rvalue - 0xFFFFFFFF - 1; // rvalue should be int32 so we wrap it back to zero
			}

			AddBackValue(this.rvalue);

			var d;
			if (this.rvalue != prevval) { // we don't put "0" into the delta buffer, because cur==prev is encoded differently
				if (this.rvalue > prevval) {
					// console.log("*** rvalue > prevval");
					d = this.rvalue - prevval;
					// console.log(d);
					if (d < 0x7FFFFFFF) { // no overflow
						AddBackDelta(d);
					}
				} else { // rvalue<prevval
					// console.log("*** rvalue < prevval");
					d = prevval - this.rvalue;
					// console.log(d);
					if (d < 0x7FFFFFFF) { // no overflow
						AddBackDelta(-d);
					}
				}
			}

			if (overflow) {
				// assert(!"buffer overflow!");
				// console.log("buffer overflow");
				InValueQueue = 0;
				this.rvalue = 0;
				return false;
			}

			return true;
		};

		this.getCurByte = function() {
			return uCurByte;
		};

		this.setCurByte = function(curByte) {
			uCurByte = curByte;
		};

		this.moveCurByte = function(amount) {
			uCurByte = uCurByte + amount;
		};
	};

	return IndexCompressor;
});
