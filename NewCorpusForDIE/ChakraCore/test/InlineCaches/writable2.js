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
//  When CLEAR writable on a SHARED SimpleTypeHandler, we fail to ChangeType, thus fail to invalidate cache.
//  This test exploits the bug with PropertyString cache.
//

// Get a property string to manipulate with it
function getPropertyString(x, name) {
    var names = Object.getOwnPropertyNames(f);
    var i = names.indexOf(name);
    return names[i];
}

function changePrototype(f, expectedSucceed, msg) {
    var tmp = new Object();

    // This exploits the PropertyString fast path in OP_SetElementI
    var proto = getPropertyString(f, "prototype");
    f[proto] = tmp;

    var succeeded = (f.prototype === tmp);
    assert(succeeded === expectedSucceed, msg);
}

// Initially we use a shared SimpleTypeHandler with "prototype" property for a function.
function f() { }

changePrototype(f, true, "Should be able to change f.prototype initially");

Object.defineProperty(f, "prototype", { writable: false });
changePrototype(f, false, "f.prototype is now not writable, shouldn't be changed");

endTest();
