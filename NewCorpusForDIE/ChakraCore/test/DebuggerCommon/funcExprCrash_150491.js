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

// Validation of No-refresh attach and the function expression with a name with forcedeferparse. Bug : 150491

var top = {};
function Pass(f)
{
    f();
}
function test(aa, dd)
{
    top.f1 = aa;
}

Pass(function d2() {
    var i = false,
        f = "body",
        m, g = 0,
        a = 0,
        b = 0,
        l = 0,
        n = 0,
        h = 0,
        o = true,
        k, c, q, p;
    try {
        i = true
    } catch (j) {}
    if (!i) {
        return
    }
    p = false;
    q = !p && true;

    function d3() {
        m = {width:10, height:20};
        if (q && false) {
            c = (Math.abs(n) > 1 || Math.abs(h) > 1)
        } else {
            c = (n || h)
        }
        if (c) {                            /**bp:locals(1)**/
            b = g;
            l = a;
            if (p) {
                var tt = function s(u, t) {
                    u; t;
                }
            } else {
                if (q) {
                    try {
                        if (o) {
                            o = false;
                        }
                    } catch (r) {}
                }
            }
        }
    }
    test(d3,200);
});

WScript.Attach(top.f1);
WScript.Echo("Pass");
