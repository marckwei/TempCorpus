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

Object.defineProperty(x, "b", {
    get: function () { return this.foo + 1; },
    set: function (x) { this.foo = x / 2; }
});

Object.defineProperty(x, "onlyone", {
    get: function () { return this.bar; }
});

var y = {};
Object.defineProperty(y, "pdata", { value : 24 });
Object.defineProperty(y, "pwrite", {value : 12, writable: true});
Object.defineProperty(y, "pdel", {get : function() {return "pdel";}, configurable: true});
Object.defineProperty(y, "pconfig", {get : function() {return "pconfig";}, configurable: true});
Object.defineProperty(y, "penum", {get : function() {return "penum";}, enumerable: true});

var oWritable = {};
Object.defineProperty(oWritable, "p", { writable: true });

var oNotWritable = {};
Object.defineProperty(oNotWritable, "p", { writable: false });

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    telemetryLog(`typeof (x): ${typeof (x)}`, true); //object

    telemetryLog(`x.foo: ${x.foo}`, true); //3
    telemetryLog(`x.b: ${x.b}`, true); //4

    telemetryLog(`x.onlyone: ${x.onlyone}`, true); //null

    ////
    x.b = 12;
    ////

    telemetryLog(`x.foo: ${x.foo}`, true); //6
    telemetryLog(`x.b: ${x.b}`, true); //7

    telemetryLog(`Object.getOwnPropertyDescriptor(y.pdata): ${JSON.stringify(Object.getOwnPropertyDescriptor(y, "pdata"))}`, true); //asdf
    telemetryLog(`Object.getOwnPropertyDescriptor(y.pwrite): ${JSON.stringify(Object.getOwnPropertyDescriptor(y, "pwrite"))}`, true); //asdf
    telemetryLog(`Object.getOwnPropertyDescriptor(y.pdel): ${JSON.stringify(Object.getOwnPropertyDescriptor(y, "pdel"))}`, true); //asdf
    telemetryLog(`Object.getOwnPropertyDescriptor(y.pconfig): ${JSON.stringify(Object.getOwnPropertyDescriptor(y, "pconfig"))}`, true); //asdf
    telemetryLog(`Object.getOwnPropertyDescriptor(y.penum): ${JSON.stringify(Object.getOwnPropertyDescriptor(y, "penum"))}`, true); //asdf

    telemetryLog(`y.pdel: ${y.pdel}`, true); //pdel
    delete y.pdel; //no exception here
    telemetryLog(`y.pdel: ${y.pdel}`, true); //undef
    telemetryLog(`Object.getOwnPropertyDescriptor(y.pdel): ${JSON.stringify(Object.getOwnPropertyDescriptor(y, "pdel"))}`, true); //asdf

    oWritable.p = 10;
    oNotWritable.p = 10;
    telemetryLog(`oWritable.p: ${oWritable.p}`, true); //10
    telemetryLog(`oNotWritable.p: ${oNotWritable.p}`, true); //undef

    emitTTDLog(ttdLogURI);
}