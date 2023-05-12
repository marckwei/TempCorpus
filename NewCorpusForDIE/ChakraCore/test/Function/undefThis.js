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

// Tests to verify that "undefined" is passed as "this" to non-property-reference callees

function echo(x) { WScript.Echo(x + ''); }

try {
    echo((1, Object.prototype.valueOf)());
}
catch (e) {
    echo(e);
}

try {
    var foo = Object.prototype.valueOf;
    echo(foo());
}
catch (e) {
    echo(e);
}

(function () {
    try {
        echo((1, Object.prototype.valueOf)());
    }
    catch (e) {
        echo(e);
    }

    try {
        var foo = Object.prototype.valueOf;
        echo(foo());
    }
    catch (e) {
        echo(e);
    }
})();


function f1() {
    "use strict";
    var f1a = function () {
        echo(this === undefined);
    }
    f1a();
}
f1();

function f2() {
    function f2a() {
        "use strict";
        echo(this === undefined);
    }
    f2a();
}
f2();

function x() {
    "use strict";
    echo(this);
}
x.bind()();
