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

var x = { foo: 3, bar: null };
var y = x;

y.baz = "new prop";

var z = new Object();
z['foo'] = 3;
z[1] = "bob";
z['2'] = "bob2";

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    telemetryLog(`typeof (x): ${typeof (x)}`, true); //object
    telemetryLog(`typeof (z): ${typeof (z)}`, true); //object;

    telemetryLog(`x === y: ${x === y}`, true); //true
    telemetryLog(`x !== z: ${x !== z}`, true); //true

    telemetryLog(`y.foo: ${y.foo}`, true); //3
    telemetryLog(`z.foo: ${z.foo}`, true); //3
    telemetryLog(`z[1]: ${z[1]}`, true); //bob
    telemetryLog(`z[2]: ${z[2]}`, true); //bob2

    telemetryLog(`x.foo: ${x.foo}`, true); //3
    telemetryLog(`x.bar: ${x.bar}`, true); //null
    telemetryLog(`x.baz: ${x.baz}`, true); //new prop"

    telemetryLog(`x.notPresent: ${x.notPresent}`, true); //undefined
    telemetryLog(`z[0]: ${z[0]}`, true); //undefined
    telemetryLog(`z[5]: ${z[5]}`, true); //undefined

    ////
    z.foo = 0;
    y.foo = 10;
    y.foo2 = "ten";
    y[10] = "foo";
    y.bar = 3;
    ////

    telemetryLog(`post update -- z[0]: ${z[0]}`, true); //undefined
    telemetryLog(`post update -- z.foo: ${z.foo}`, true); //0
    telemetryLog(`post update -- x.foo: ${x.foo}`, true); //10
    telemetryLog(`post update -- x.foo2: ${x.foo2}`, true); //ten
    telemetryLog(`post update -- x[0]: ${x[0]}`, true); //undefined
    telemetryLog(`post update -- x[10]: ${x[10]}`, true); //foo

    telemetryLog(`post update -- y.bar: ${y.bar}`, true); //3
    telemetryLog(`post update -- x.bar: ${x.bar}`, true); //3

    emitTTDLog(ttdLogURI);
}