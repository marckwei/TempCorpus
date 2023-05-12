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

(function test0Runner() {
    var shouldBailout = 0;
    function test0() {
        var o = { prop0: 0 };
        var n = 0;
        var i = 0;
        while(i < 2) {
            while(o.prop0 < 0)
                while(i + 1)
                    o.prop0 = 0;
            if(shouldBailout)
                delete o.prop0;
            ++n;
            ++i;
        }
        WScript.Echo("test0: " + n);
    };
    test0();
    shouldBailout = 1;
    test0();
})();

function test1(o, x) {
    var c = 1.1;
    c += 0.1;
    x += 0.1;
    test1a(x);
    var sum = -1;
    for(var i = 0; i < 2; ++i) {
        var d;
        if(o)
            d = 2.2;
        else
            d = 2.3;
        for(var j = 0; j < 2; ++j)
            if(i === 1)
                sum += o.d;
        test1a(x);
        x = c;
        c = d;
        test1a(x);
    }
    return sum;

    function test1a(x) {
        try {
            WScript.Echo("test1: " + x);
        }
        catch(ex) {
        }
    }
}
(function test1Runner() {
    var o = { a: 0.1, b: 0.1, c: 0.1, d: 3.1 };
    WScript.Echo("test1: " + test1(o, 0.1));
    o.d = "4.1";
    WScript.Echo("test1: " + test1(o, 0.1));
})();
