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

//
// Test throw an object with Error or Error.prototype in its prototype chain
//

function Dump(output) {
    if (this.WScript) {
        WScript.Echo(output);
    } else {
        alert(output);
    }
}

function testErrorStack(throwObject, msg) {
    Dump(msg);
    try {
        throw throwObject;
    } catch (e) {
        Dump(TrimStackTracePath(e.stack));
    }
    Dump("");
}

function testErrorPrototype(proto, msg) {
    function E(msg) {
        this.message = msg;
    }
    E.prototype = proto;

    testErrorStack(new E(msg), msg);
}

function testErrorPrototypeChain(proto, msg) {
    function P(){}
    P.prototype = proto;

    testErrorPrototype(proto, "Prototype is " + msg);
    testErrorPrototype(new P(), "Prototype has " + msg);
}

function runtest() {
    testErrorPrototypeChain(new Error(), "new Error()");
    testErrorPrototypeChain(Error.prototype, "Error.prototype");
    testErrorPrototypeChain(new RangeError(), "new RangeError()");
    testErrorPrototypeChain(RangeError.prototype, "RangeError.prototype");

    testErrorPrototypeChain(123, "123");
    testErrorPrototypeChain(new String(), "new String()");

    testErrorStack(Error.prototype, "throw Error.prototype");
    testErrorStack(RangeError.prototype, "throw RangeError.prototype");
    testErrorStack(TypeError.prototype, "throw TypeError.prototype");
}

if (this.WScript && this.WScript.LoadScriptFile) {
    this.WScript.LoadScriptFile("../UnitTestFramework/TrimStackTracePath.js");
}
runtest();
