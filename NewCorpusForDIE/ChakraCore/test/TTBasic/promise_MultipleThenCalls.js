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

let val = -7

let turi = '';
let elog = () => {};
let tlog = (msg, val) => { console.log(msg); }
if (typeof telemetryLog !== 'undefined') {
    tlog = telemetryLog;
    elog = emitTTDLog;
    turi = ttdLogURI;
}

function addThens()
{
    let resolveFunc;
    const p = new Promise((resolve, reject) => {
        resolveFunc = resolve;
    });
    
    WScript.SetTimeout(() => {
        p.then(() => {
            val = val * 3;
        });
    }, 200);
    
    WScript.SetTimeout(() => {        
        p.then(() => {
            val = val + 21
        });
    }, 300);

    WScript.SetTimeout(resolveFunc, 400);
    WScript.SetTimeout(testFunction, 1000);
}

WScript.SetTimeout(addThens, 100);

function testFunction()
{
    tlog(`val is ${val} (Expect 0)`, true);

    elog(turi);
}
