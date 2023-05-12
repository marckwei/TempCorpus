function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

WScript = {
    _jscGC: gc,
    _jscPrint: console.log,
    _convertPathname : function(dosStylePath)
    {
        return dosStylePath.replace(/\\/g, "/");
    },
    Arguments : [ "summary" ],
    Echo : function()
    {
        WScript._jscPrint.apply(this, arguments);
    },
    LoadScriptFile : function(path)
    {
    },
    Quit : function()
    {
    },
    Platform :
    {
        "BUILD_TYPE": "Debug"
    }
};

function CollectGarbage()
{
    WScript._jscGC();
}

function $ERROR(e)
{
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

//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

Object.defineProperty(Object.getPrototypeOf({}), "echo", { value: function () { WScript.Echo(this); } });
function AssertEqual(actual, expected, msg) { ((actual === expected ? "Passed! " : "Failed (actual: " + actual + ", expected: " + expected + "). Message: ") + msg).echo(); };
Object.defineProperty(Object.getPrototypeOf({}), "equalTo", { value: function (other, msg) { AssertEqual(this.constructor(this), other, msg); } });


try {
    String.prototype.codePointAt.call();
} catch (e) {
    e.echo();
}

try {
    String.prototype.codePointAt.call(null);
} catch (e) {
    e.echo();
}
try {
    String.prototype.codePointAt.call(undefined);
} catch (e) {
    e.echo();
}

try {
    new String.prototype.codePointAt();
} catch (e) {
    e.echo();
}

try {
    String.fromCodePoint.call();
} catch (e) {
    "Fail!".echo();
}

try {
    String.fromCodePoint.call(null);
} catch (e) {
    "Fail!".echo();
}
try {
    String.fromCodePoint.call(undefined);
} catch (e) {
    "Fail!".echo();
}

try {
    new String.fromCodePoint();
} catch (e) {
    e.echo();
}

try {
    String.fromCodePoint(1.1);
} catch (ex) {
    ex.echo();
}

try {
    String.fromCodePoint(100000000);
} catch (ex) {
    ex.echo();
}

try {
    String.fromCodePoint(-0.0001);
} catch (ex) {
    ex.echo();
}

try {
    String.fromCodePoint(Infinity);
} catch (ex) {
    ex.echo();
}


AssertEqual("".codePointAt(0), undefined, "Size = 0, index 0 test.");
AssertEqual("a".codePointAt(-1), undefined, "Size = 1, index -1 test.");
String.fromCodePoint(97).codePointAt(0).equalTo(97, "Simple character test.");
String.fromCodePoint(65536).codePointAt(0).equalTo(65536, "Surrogate pair treated as a single code point.");
String.fromCodePoint(65536).codePointAt(1).equalTo(56320, "Index pointing to a second surrogate code unit returns the value of that code unit.");
String.fromCodePoint(55296).codePointAt(0).equalTo(55296, "Partial surrogate code unit.");
String.fromCodePoint(55295, 56320).codePointAt(0).equalTo(55295, "First surrogate code unit not in range [D800-DBFF].");
String.fromCodePoint(56320, 56320).codePointAt(0).equalTo(56320, "First surrogate code unit not in range [D800-DBFF].");
String.fromCodePoint(65536).codePointAt(0).equalTo(65536, "First surrogate code unit min value.");
String.fromCodePoint(55296, 56320).codePointAt(0).equalTo(65536, "First surrogate code unit min value.");
String.fromCodePoint(1113088).codePointAt(0).equalTo(1113088, "First surrogate code unit max value.");
String.fromCodePoint(56319, 56320).codePointAt(0).equalTo(1113088, "First surrogate code unit max value.");
String.fromCodePoint(55296, 56319).codePointAt(0).equalTo(55296, "Second surrogate code unit not in range [DC00-DFFF].");
String.fromCodePoint(55296, 57344).codePointAt(0).equalTo(55296, "Second surrogate code unit not in range [DC00-DFFF].");
String.fromCodePoint(65536).codePointAt(0).equalTo(65536, "Second surrogate code unit min value.");
String.fromCodePoint(55296, 56320).codePointAt(0).equalTo(65536, "Second surrogate code unit min value.");
String.fromCodePoint(66559).codePointAt(0).equalTo(66559, "Second surrogate code unit max value.");
String.fromCodePoint(55296, 57343).codePointAt(0).equalTo(66559, "Second surrogate code unit max value.");

String.prototype.codePointAt.call(5, 0).equalTo(53, "Calling on a number object instead of string object.");

if(String.fromCodePoint.length !== 1) {
    WScript.Echo("String.fromCodePoint length should be 1, actual: " + String.fromCodePoint.length);
}