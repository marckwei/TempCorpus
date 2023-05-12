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

var res = []

function test1() 
{
    [].push.apply(this, arguments);
    res.push(1);
}

test1();

function test2() 
{
    ({}).toString.apply(this, arguments);
    res.push(2);
}

test2();

var count3 = 0;
function test3() 
{
    var args = arguments;
    function test3_inner() {
        (count3 == 1 ? args : arguments).callee.apply(this, arguments);
    }

    if (++count3 == 1)
    {
        return test3_inner();
    }
    res.push(3);
}

test3();

function test4()
{
    return function() {
    try {
        throw 4;
    } catch(ex) {
        res.push(4);
        var f = arguments[0]; 
    }
    f.apply(this, arguments);
    }
}
test4()(function(){ res.push(5); });

for (var i = 0; i < 5; ++i) {
    if (res[i] !== i + 1) {
        throw "fail";
    }
}

print("pass");
