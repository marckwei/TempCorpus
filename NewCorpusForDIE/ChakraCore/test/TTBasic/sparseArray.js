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

var a = new Array(0x15000); //makes this sparse

var i=0;

for(var i=50;i<60;i++)
{
  a[i] = i+10;
}

for(var i=0;i<10;i++)
{
  a[i] = i+20;
}

for(var i=100;i<110;i++)
{
  a[i] = i*10;
}

var b = new Array(0x15000); //makes this sparse

for(var i=50;i<60;i++)
{
  a[i] = i+10;
}

for(var i=0;i<10;i++)
{
  a[i] = i+20;
}

for(var i=100;i<110;i++)
{
  a[i] = i+40;
}

var c = a.concat(b);

var  d = a.slice(10);

var x = [];
x[0xFFFFFFFF] = 0;
x[0xFFFFFFFE] = 1;
x[0xFFFFFFFD] = 2;

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    telemetryLog(`${c[50]}`, true);
    telemetryLog(`${c[0]}`, true);

    telemetryLog(`${a.shift()}`, true);
    telemetryLog(`${a[7]}`, true);
    telemetryLog(`${a[8]}`, true);
    telemetryLog(`${a.shift()}`, true);
    telemetryLog(`${a.length}`, true);

    telemetryLog(`${d[41]}`, true);
    telemetryLog(`${d[90]}`, true);

    a.splice(45,3,"a","b","c");

    telemetryLog(`${a[45]}`, true);
    telemetryLog(`${a[46]}`, true);
    telemetryLog(`${a[50]}`, true);
    telemetryLog(`${a[100]}`, true);
    telemetryLog(`${a.length}`, true);

    telemetryLog(`${x[0xFFFFFFFF]} ${x.length}`, true);
    telemetryLog(`${x[0xFFFFFFFE]} ${x.length === 0xFFFFFFFF}`, true);
    telemetryLog(`${x[0xFFFFFFFD]} ${x.length === 0xFFFFFFFF}`, true);

    emitTTDLog(ttdLogURI);
}