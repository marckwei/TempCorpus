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
x.foo2 = 6;

var y = { foo: 5, bar: 'bar', baz: null };
delete y.bar;
y.bar2 = 'bar2'

var z = { foo: 10, bar: 'bar' };
delete z.bar;
z.baz = 'baz'
z.bar = 'bar'

var xo = [];
for(var xname in x)
{
    xo.push(xname);
}

var yo = [];
for(var yname in y)
{
    yo.push(yname);
}

var zo = [];
for(var zname in z)
{
    zo.push(zname);
}

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    var idx = -1;
    
    idx = 0;
    for(var xname in x)
    {
        telemetryLog(`xname: ${xname === xo[idx]}`, true); //true
        idx++;    
    }
    
    idx = 0;
    for(var yname in y)
    {
        telemetryLog(`yname: ${yname === yo[idx]}`, true); //true
        idx++;    
    }
    
    idx = 0;
    for(var zname in z)
    {
        telemetryLog(`zname: ${zname === zo[idx]}`, true); //true
        idx++;    
    }

    emitTTDLog(ttdLogURI);
}