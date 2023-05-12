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

var x = foo(1, 2, 3);
var y = fooDeleted(1, 2, 3);

function foo(a, b, c)
{
    var res = {};
    var args = arguments;
    
    res.length = function() { return args.length; };
    res.named = function() { return b; };
    res.position = function() { return args[1]; };
   
    return res;
}

function fooDeleted(a, b, c)
{
    delete arguments[1];

    var res = {};
    var args = arguments;
    
    res.length = function() { return args.length; };
    res.named = function() { return b; }; 
    res.position = function() { return args[1]; };
   
    return res;
}

WScript.SetTimeout(testFunction, 20);

function testFunction()
{
    telemetryLog(`xlength: ${x.length()}`, true); //3
    telemetryLog(`xnamed: ${x.named()}`, true); //2
    telemetryLog(`xposition: ${x.position()}`, true); //2
    
    telemetryLog(`ylength: ${y.length()}`, true); //3
    telemetryLog(`ynamed: ${y.named()}`, true); //2
    telemetryLog(`yposition: ${y.position()}`, true); //undefined

    emitTTDLog(ttdLogURI);
}


