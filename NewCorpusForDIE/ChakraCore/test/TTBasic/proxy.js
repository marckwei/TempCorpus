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

var handler1 = {
    get: function(target, key)
    {
        return key in target ? target[key] : 'Not Found';
    }
};

var handler2 = {
    get: function(target, key)
    {
        return "[[" + key + "]]";;
    }
};

var p = new Proxy({}, handler1);
p.a = 1;

var revocable = Proxy.revocable({}, handler2);
var proxy = revocable.proxy;

var revocableDone = Proxy.revocable({}, handler2);
var proxyDone = revocableDone.proxy;

revocableDone.revoke();

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    var threw = false;
        
    telemetryLog(`p.a: ${p.a}`, true); //1);
    telemetryLog(`p.b: ${p.b}`, true); //Not Found

    try
    {
        proxyDone.foo;
    }
    catch(e)
    {
        threw = true;
    }
    telemetryLog(`proxyDone.foo: ${threw}`, true); //true

    telemetryLog(`proxy.foo: ${proxy.foo}`, true); //[[foo]]

    revocable.revoke();
    try
    {
        proxy.foo;
    }
    catch(e)
    {
        threw = true;
    }
    telemetryLog(`proxy.foo (after revoke): ${threw}`, true); //true

    emitTTDLog(ttdLogURI);
}