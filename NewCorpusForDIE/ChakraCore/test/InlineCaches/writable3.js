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
// Test changing [writable] attribute should trigger Type transition.
//
var echo = this.WScript ? WScript.Echo : function () { console.log([].join.apply(arguments, [", "])); };
function assert(value, msg) { if (!value) { throw new Error("Failed: " + msg); } }
function endTest() { echo("pass"); }

//
// Win8: 713428
//
//  When SET writable on a NON-shared SimpleTypeHandler, we fail to ChangeType, thus fail to invalidate cache.
//  This test exploits the bug with inline cache.
//

function changePrototype(f, expectedSucceed, msg) {
    var tmp = new Object();

    // This exploits inline cache
    f.prototype = tmp;

    var succeeded = (f.prototype === tmp);
    assert(succeeded === expectedSucceed, msg);
}

// Make f to use a NON-shared SimpleTypeHandler
var f = new Boolean(true);  // NullTypeHandler
f.prototype = 12;           // Evolve to Non-shared SimpleTypeHandler

Object.defineProperty(f, "prototype", { writable: false }); // Clear writable
changePrototype(f, false, "Should not be able to change f.prototype, writable false");

Object.defineProperty(f, "prototype", { writable: true });  // SET writable
changePrototype(f, true, "f.prototype is now writable, should be changed");

endTest();
