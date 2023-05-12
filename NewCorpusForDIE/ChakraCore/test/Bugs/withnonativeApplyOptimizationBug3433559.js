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

var foo = function(){}
function letTest() {
    let sc1 = 0;
    with({})
    {
        sc1 = foo;
        sc1();
    }
    this.method0.apply(this, arguments);
}

function constTest() {
    const sc1 = 0;
    with({})
    {
        sc1 = foo;
        sc1();
    }
    this.method0.apply(this, arguments);
}

function varTest() {
    with({})
    {
        var sc1 = foo;
        sc1();
    }
    this.method0.apply(this, arguments);
}

function TryFunction(f)
{
    try
    {
        f();
    }catch (e) {
        if (e instanceof TypeError) { // Unable to get property 'apply' of undefined or null reference (method0)
            return true;
        }
        if (e instanceof ReferenceError) { // Assignment to const
            return true;
        }
    }
}
if(TryFunction(letTest) && TryFunction(constTest) && TryFunction(varTest))
{
    print("Pass");
}
