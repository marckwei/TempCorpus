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

// The << Software identified by reference to the Ecma Standard* ("Software)">>  is protected by copyright and is being
// made available under the  "BSD License", included below. This Software may be subject to third party rights (rights
// from parties other than Ecma International), including patent rights, and no licenses under such third party rights
// are granted under this license even if the third party concerned is a member of Ecma International.  SEE THE ECMA
// CODE OF CONDUCT IN PATENT MATTERS AVAILABLE AT http://www.ecma-international.org/memento/codeofconduct.htm FOR
// INFORMATION REGARDING THE LICENSING OF PATENT CLAIMS THAT ARE REQUIRED TO IMPLEMENT ECMA INTERNATIONAL STANDARDS*.
//
// Copyright (C) 2012-2013 Ecma International
// Copyright (C) 2021 Google Inc. All rights reserved.
// Copyright (C) 2021 Apple Inc. All rights reserved.
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
// following conditions are met:
// 1.   Redistributions of source code must retain the above copyright notice, this list of conditions and the following
//      disclaimer.
// 2.   Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
//      following disclaimer in the documentation and/or other materials provided with the distribution.
// 3.   Neither the name of the authors nor Ecma International may be used to endorse or promote products derived from
//      this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE ECMA INTERNATIONAL "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
// SHALL ECMA INTERNATIONAL BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
// DAMAGE.
//
// * Ecma International Standards hereafter means Ecma International Standards as well as Ecma Technical Reports

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

if ($vm.icuHeaderVersion() >= 64) {
    {
        const date = new Date(2019, 7, 10,  1, 2, 3, 234);

        let dtf = new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" });
        shouldBe(dtf.formatRange(date, date), dtf.format(date));

        dtf = new Intl.DateTimeFormat("en", { minute: "numeric", second: "numeric" });
        shouldBe(dtf.formatRange(date, date), dtf.format(date));

        dtf = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", minute: "numeric" });
        shouldBe(dtf.formatRange(date, date), dtf.format(date));

        dtf = new Intl.DateTimeFormat("en", { dateStyle: "long", timeStyle: "short" });
        shouldBe(dtf.formatRange(date, date), dtf.format(date));
    }

    {
        // date1 and date2 are practically equal since the following formats do not show milliseconds.
        const date1 = new Date(2019, 7, 10,  1, 2, 3, 234);
        const date2 = new Date(2019, 7, 10,  1, 2, 3, 235);

        shouldBe(date1.getTime() !== date2.getTime(), true);

        let dtf = new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" });
        shouldBe(dtf.formatRange(date1, date2), dtf.format(date1));

        dtf = new Intl.DateTimeFormat("en", { minute: "numeric", second: "numeric" });
        shouldBe(dtf.formatRange(date1, date2), dtf.format(date1));

        dtf = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", minute: "numeric" });
        shouldBe(dtf.formatRange(date1, date2), dtf.format(date1));

        dtf = new Intl.DateTimeFormat("en", { dateStyle: "long", timeStyle: "short" });
        shouldBe(dtf.formatRange(date1, date2), dtf.format(date1));
    }
}
