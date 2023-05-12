function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

function noInline() {
}

function OSRExit() {
}

function ensureArrayStorage() {
}

function fiatInt52(i) {
	return i;
}

function noDFG() {
}

function noOSRExitFuzzing() {
}

function isFinalTier() {
	return true;
}

function transferArrayBuffer() {
}

function fullGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function edenGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function forceGCSlowPaths() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function noFTL() {

}

function debug(x) {
	console.log(x);
}

function describe(x) {
	console.log(x);
}

function isInt32(i) {
	return (typeof i === "number");
}

function BigInt(i) {
	return i;
}

if (typeof(console) == "undefined") {
    console = {
        log: print
    };
}

if (typeof(gc) == "undefined") {
  gc = function() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
  }
}

if (typeof(BigInt) == "undefined") {
  BigInt = function (v) { return new Number(v); }
}

if (typeof(BigInt64Array) == "undefined") {
  BigInt64Array = function(v) { return new Array(v); }
}

if (typeof(BigUint64Array) == "undefined") { 
  BigUint64Array = function (v) { return new Array(v); }
}

if (typeof(quit) == "undefined") {
  quit = function() {
  }
}

// Copyright 2021 the V8 project authors. All rights reserved.
// Copyright 2021 Apple Inc. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual + " " + expected);
}

const nf = new Intl.NumberFormat("en-US");
const nf2 = new Intl.NumberFormat("ja-JP");
const string = "987654321987654321";
const string2 = "987654321987654322";
shouldBe(nf.format(string), `987,654,321,987,654,321`);
shouldBe(nf2.format(string), `987,654,321,987,654,321`);
if (nf.formatRange) {
    shouldBe(nf.formatRange(string, string2), `987,654,321,987,654,321–987,654,321,987,654,322`);
    shouldBe(nf2.formatRange(string, string2), `987,654,321,987,654,321～987,654,321,987,654,322`);
}
if (nf.formatRangeToParts) {
    shouldBe(JSON.stringify(nf.formatRangeToParts(string, string2)), `[{"type":"integer","value":"987","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"654","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"321","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"987","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"654","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"321","source":"startRange"},{"type":"literal","value":"–","source":"shared"},{"type":"integer","value":"987","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"654","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"321","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"987","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"654","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"322","source":"endRange"}]`);
    shouldBe(JSON.stringify(nf2.formatRangeToParts(string, string2)), `[{"type":"integer","value":"987","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"654","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"321","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"987","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"654","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"321","source":"startRange"},{"type":"literal","value":"～","source":"shared"},{"type":"integer","value":"987","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"654","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"321","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"987","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"654","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"322","source":"endRange"}]`);
}
