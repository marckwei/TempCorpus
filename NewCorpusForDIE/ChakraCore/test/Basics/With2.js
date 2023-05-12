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

function X()
{
    this.x = 1;
}
function Y(s)
{
    this[s] = 2;
}
function Z()
{
    this.z = 3;
}

Y.prototype = new Z();
X.prototype = new Y("y");

var x = new X();
var y = new Y("yy");
var z = new Z();

with(x)
{
    WScript.Echo("x.x = " + x);
    WScript.Echo("x.y = " + y);
    WScript.Echo("x.z = " + z);

    ++z;

    WScript.Echo("x.z = " + z);

    // refers to x.y
    with(y)
    {
        WScript.Echo("x.x = " + x);
        WScript.Echo("x.y = " + y);
        WScript.Echo("x.z = " + z);
    }

    y = new Object();

    y.m = 7;

    // refers to x.y
    with(y)
    {
        WScript.Echo("x.y.m = " + m);
    }

    y = undefined;

    if(y == undefined)
    {
        WScript.Echo("OK: y in with scope is undefined");
    }

    Z.prototype.zz = 1;

    WScript.Echo("x.zz = " + zz);

    // get rid of x.x
    x = undefined;

    if(x == undefined)
    {
        WScript.Echo("OK: x in with scope is undefined");
    }
}

with(Z.prototype)
{
    zz *= 10;
    with(Z)
    {
        prototype.zz++;

        with(prototype)
        {
            zz *= 100;
        }
    }
}

var q = new Y("a");

with(x)
{
    WScript.Echo("x.x = " + x);
    WScript.Echo("x.y = " + y);
    WScript.Echo("x.z = " + z);
    WScript.Echo("x.zz = " + zz);
}

with(q) { with(q) { with(q) {

    WScript.Echo("q.a = " + a);
    WScript.Echo("q.zz = " + zz);

}}}

(function () {
    function a()
    {
        WScript.Echo("a is called");
    }

    (function(){
        try {
            throw a;
        }
        catch(x) {
            with({}){
                x();
            }
        }
    })();
})();

(function () {
    var o = {};
    var y = function x(){
        with(o){
            x(o.x = function(){});
        }
    };

    y();
})();
