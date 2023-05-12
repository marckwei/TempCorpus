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

function PropertyExists(obj, propName)
{
    return obj.hasOwnProperty(propName);
}

var val = 100;
function IncrVal()
{
    telemetryLog(`IncrVal:: ${this.val}  args.length : ${arguments.length}`, true);
    this.val++;
    return this.val + " " + arguments.length;
}

var fGlobalThis1 = IncrVal.bind();
var fGlobalThis2 = IncrVal.bind(this);
var fGlobalThis3 = IncrVal.bind(this, 50);

var fGlobalThisNull = IncrVal.bind(null);

var objWithVal1 = { val : 200 }
var fLocal1 = IncrVal.bind(objWithVal1);

var x = 20;
var y = 30;

function add()
{
    return this.x + this.y;
}

var o = { x: 5, y: 6};
var f = add.bind(o);

var f2 = new f();

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    telemetryLog(`global object 1 ${fGlobalThis1()}`, true);
    telemetryLog(`global object 1 ${fGlobalThis1(10,20)}`, true);
    telemetryLog(`global object 2 ${fGlobalThis2()}`, true);
    telemetryLog(`global object 2 ${fGlobalThis2(10,20)}`, true);
    telemetryLog(`global object 3 ${fGlobalThis3()}`, true);
    telemetryLog(`global object 3 ${fGlobalThis3(10,20)}`, true);

    telemetryLog(`global object null ${fGlobalThisNull(10,20)}`, true);

    telemetryLog(`local length ${fLocal1.length}`, true);
    telemetryLog(`Local object2 ${fLocal1(10)}`, true);

    telemetryLog(`Add Test ${add()}`, true);
    telemetryLog(`f Test ${f()}`, true);

    telemetryLog(`Proto Test ${add.prototype.isPrototypeOf(f2)}`, true);

    emitTTDLog(ttdLogURI);
}
