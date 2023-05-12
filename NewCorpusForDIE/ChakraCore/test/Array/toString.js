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

var echo = WScript.Echo;

function guarded_call(func) {
    try {
        func();
    } catch (e) {
        echo(e.name + " : " + e.message);
    }
}

var testCount = 0;
function scenario(title) {
    if (testCount > 0) {
        echo("\n");
    }
    echo((testCount++) + ".", title);
}

scenario("Array: default");
var arr = [1, 2, , 3];
echo(arr);

scenario("Array: Replaced Array.prototype.join");
Array.prototype.join = function () { return "replaced Array.prototype.join" };
echo(arr);

scenario("Array: Replaced non-callable Array.prototype.join");
Array.prototype.join = 1234; // non-callable
echo(arr);

scenario("Object: no join");
var o = {};
guarded_call(function () {
    echo(Array.prototype.toString.apply(o));
});

scenario("Object: has join");
var o = {
    join: function () { return "o join"; }
};
guarded_call(function () {
    echo(Array.prototype.toString.apply(o));
});

scenario("Object: non-callable join");
var o = {
    join: 1234
};
guarded_call(function () {
    echo(Array.prototype.toString.apply(o));
});

scenario("Object: no join with toStringTag");
var o = {
    [Symbol.toStringTag]: "Replaced @@toStringTag"
};
guarded_call(function () {
    echo(Array.prototype.toString.apply(o));
});

scenario("Object: no join with getter toStringTag");
var o = {
    get [Symbol.toStringTag]() {return "Replaced @@toStringTag with a getter";}
};
guarded_call(function () {
    echo(Array.prototype.toString.apply(o));
});

scenario("Object: no join, replaced Object.prototype.toString");
var o = {};
Object.prototype.toString = function () { return "replaced Object.prototype.toString"; }
guarded_call(function () {
    echo(Array.prototype.toString.apply(o));
});
