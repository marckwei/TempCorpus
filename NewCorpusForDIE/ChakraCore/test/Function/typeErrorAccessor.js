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

function write(v) { print(v + ""); }

function printDesc(d) {
    write(`${typeof d}, ${typeof d.set}, ${typeof d.get}, ${d.set === d.get}`);

    var s = "value:" + d.value + ", writable:" + d.writable + ", enumerable:" + d.enumerable + ", configurable:" + d.configurable;
    s += ", get:" + d.hasOwnProperty('get') + ", set:" + d.hasOwnProperty('set');

    write(s);
}

function f() { return true; };
var g = f.bind();

var callerDesc = Object.getOwnPropertyDescriptor(g.__proto__, 'caller');
var getter = callerDesc.get;

write("***************** getter ***************** ");
write("length = " + getter.length);

printDesc(Object.getOwnPropertyDescriptor(getter, 'length'));

write("***************** g.caller ***************** ");
printDesc(callerDesc);

write("***************** g.arguments ***************** ");
printDesc(Object.getOwnPropertyDescriptor(g.__proto__, 'arguments'));

write("***************** try to set/get the caller/arguments *****************");
try {
    g.caller = {};
    write("fail1");
} catch (e) {
    write("Set caller passed");
}

try {
    write(g.caller);
    write("fail2");
} catch (e) {
    write("Get caller passed");
}

try {
    g.arguments = {};
    write("fail3");
} catch (e) {
    write("Set arguments passed");
}

try {
    write(g.arguments);
    write("fail4");
} catch (e) {
    write("Get arguments passed");
}
