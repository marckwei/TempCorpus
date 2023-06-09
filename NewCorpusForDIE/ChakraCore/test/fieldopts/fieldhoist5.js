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

var test = new Object();
test.nokill_singleuse = function(o, b)
{
    var x = 0;
    var y = 0;
    for (var i = 1; i < 10000; i++)
    {
        x = (o.x) & 0x3FFFF;
        o.x = x + y;
        y = (o.x) & 0xFFFF;
    }
    return x + y;
}

test.kill_singleuse = function(o, b)
{
    var x = 0;
    var y = 0;
    for (var i = 1; i < 10000; i++)
    {
        x = (o.x) & 0x3FFFF;
        b.x = x + y;
        y = (o.x) & 0xFFFF;
    }
    return x + y;
}

test.nokill_twouse_before = function(o, b)
{
    var x = 0;
    var y = 0;
    for (var i = 1; i < 10000; i++)
    {
        x = (o.x + o.x) & 0x3FFFF;
        o.x = x + y;
        y = (o.x) & 0xFFFF;
    }
    return x + y;
}

test.kill_twouse_before = function(o, b)
{
    var x = 0;
    var y = 0;
    for (var i = 1; i < 10000; i++)
    {
        x = (o.x + o.x + o.x + o.x + o.x) & 0x3FFFF;
        b.x = x + y;
        y = (o.x) & 0xFFFF;
    }
    return x + y;
}

test.nokill_multiuse_before = function(o, b)
{
    var x = 0;
    var y = 0;
    for (var i = 1; i < 10000; i++)
    {
        x = (o.x + o.x) & 0x3FFFF;
        o.x = x + y;
        y = (o.x) & 0xFFFF;
    }
    return x + y;
}

test.kill_multiuse_before = function(o, b)
{
    var x = 0;
    var y = 0;
    for (var i = 1; i < 10000; i++)
    {
        x = (o.x + o.x + o.x + o.x + o.x) & 0x3FFFF;
        b.x = x + y;
        y = (o.x) & 0xFFFF;
    }
    return x + y;
}

test.nokill_multiuse_after = function(o, b)
{
    var x = 0;
    var y = 0;
    for (var i = 1; i < 10000; i++)
    {
        x = (o.x) & 0x3FFFF;
        o.x = x + y;
        y = (o.x + o.x + o.x + o.x + o.x) & 0xFFFF;
    }
    return x + y;
}

test.kill_multiuse_after = function(o, b)
{
    var x = 0;
    var y = 0;
    for (var i = 1; i < 10000; i++)
    {
        x = (o.x) & 0x3FFFF;
        b.x = x + y;
        y = (o.x + o.x + o.x + o.x + o.x) & 0xFFFF;
    }
    return x + y;
}

test.nokill_multiuse_before_and_after = function(o, b)
{
    var x = 0;
    var y = 0;
    for (var i = 1; i < 10000; i++)
    {
        x = (o.x + o.x + o.x + o.x + o.x) & 0x3FFFF;
        o.x = x + y;
        y = (o.x + o.x + o.x + o.x + o.x) & 0xFFFF;
    }
    return x + y;
}

test.kill_multiuse_before_and_after = function(o, b)
{
    var x = 0;
    var y = 0;
    for (var i = 1; i < 10000; i++)
    {
        x = (o.x + o.x + o.x + o.x + o.x) & 0x3FFFF;
        b.x = x + y;
        y = (o.x + o.x + o.x + o.x + o.x) & 0xFFFF;
    }
    return x + y;
}

function runtest(name, func)
{
    var total_time = 0;
    var iter = 0;
    for (var i = 0; i < 1000; i++)
    {
        o = new Object();
        o.x = 1;
        var d = new Date();
        func(o, o);
        total_time += (new Date() - d);
        iter++;
        if (total_time > 1000)
        {
            break;
        }
    }
    var output = name;
    if (name.length < 40)
    {
        for (var i = 0; i < 40 - name.length; i++)
        {
            output += " ";
        }
    }
    WScript.Echo(output + ": " + (((total_time / iter) * 1000) | 0) + " (per 1000 iteration, executed " + iter + " iterations)");
}

for (var x in test)
{
    runtest(x, test[x]);
}
