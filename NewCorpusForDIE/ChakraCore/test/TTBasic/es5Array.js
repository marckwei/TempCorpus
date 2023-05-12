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

var x = [];
x[2] = 5;
x.foo = 3;

Object.defineProperty(x, '1', {
    get: function () { return this.foo + 1; },
    set: function (x) { this.foo = x / 2; }
});

Object.defineProperty(x, 11, {
    get: function () { return this.foo; }
});

var simpleArrayEmptyLength = [];
Object.defineProperty(simpleArrayEmptyLength, "length", {});

var aFixedInfo = [0, 1, 2, 3, 4, 5];
Object.defineProperty(aFixedInfo, "length", { writable: false });
Object.defineProperty(aFixedInfo, "2", { writable: false });

var aFrozen = [0, 1, 2, 3, 4, 5];
Object.freeze(aFrozen);

var oIncFreeze = [0, 1, 2, 3, 4, 5];
for (var i = 0; i < oIncFreeze.length; i++) 
{
    Object.defineProperty(oIncFreeze, i, { writable: false, configurable: false });
}
Object.preventExtensions(oIncFreeze);

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    telemetryLog(`Array.isArray(x): ${Array.isArray(x)}`, true); //true

    telemetryLog(`x.foo: ${x.foo}`, true); //3

    telemetryLog(`x[1]: ${x[1]}`, true); //4
    telemetryLog(`x[11]: ${x[11]}`, true); //3

    ////
    x[1] = 12;
    ////

    telemetryLog(`x[1]: ${x[1]}`, true); //7
    telemetryLog(`x[11]: ${x[11]}`, true); //6

    ////
    telemetryLog(`Object.getOwnPropertyDescriptor(simpleArrayEmptyLength.length): ${JSON.stringify(Object.getOwnPropertyDescriptor(simpleArrayEmptyLength, "length"))}`, true); //asdf

    aFixedInfo[9] = 9; // This would throw in strict mode
    telemetryLog(`aFixedInfo: ${JSON.stringify(aFixedInfo)}`, true); //0, 1, 2, 3, 4, 5
    aFixedInfo[1] = -1;
    aFixedInfo[2] = -2;
    telemetryLog(`aFixedInfo: ${JSON.stringify(aFixedInfo)}`, true); //0, 1, 2, 3, 4, 5

    telemetryLog(`Object.getOwnPropertyDescriptor(aFrozen.length): ${JSON.stringify(Object.getOwnPropertyDescriptor(aFrozen, "length"))}`, true); //asdf

    telemetryLog(`isFrozen: ${Object.isFrozen(oIncFreeze)}`, true); // false, because length writable
    Object.defineProperty(oIncFreeze, "length", { writable: false });
    telemetryLog(`isFrozen: ${Object.isFrozen(oIncFreeze)}`, true);

    emitTTDLog(ttdLogURI);
}