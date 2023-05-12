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

// Test inlining of callback.
function Dispatch(f) { f(); }
function Foo() { WScript.Echo("foo"); }
function DispatchFoo() { Dispatch(Foo); }

// make Dispatch megamorphic
Dispatch(function(){})
Dispatch(function(){})
Dispatch(function(){})
Dispatch(function(){})
Dispatch(function(){})
DispatchFoo();
DispatchFoo();
DispatchFoo();

// Test inlining of a callback function with a callback.
function Bar() { WScript.Echo("bar"); }
function DispatchBar() { Dispatch(Bar); }
function NestedDispatch() { Dispatch(DispatchBar) };
NestedDispatch();
NestedDispatch();
NestedDispatch();

// Test inlining of callback with argument
function Dispatch2(f, arg) { f(arg); }
function Blah(arg) { WScript.Echo(arg); }
function DispatchBlah(arg) { Dispatch2(Blah, arg) }

// make dispatch2 polymorphic.
Dispatch2(function(){})
Dispatch2(function(){})
DispatchBlah("blah");
DispatchBlah("blah");
DispatchBlah("blah");

// This will fail to inline the callback because currently we track at most one callback arg per callsite
function Dispatch3(a, b) { a(); b(); }
function DispatchFooBar() { Dispatch3(Foo, Bar); }
Dispatch3(function(){}, function(){});
Dispatch3(function(){}, function(){});
DispatchFooBar();
DispatchFooBar();
DispatchFooBar();

// test inlining of callback.call
function DispatchCall(callback, thisArg) { callback.call(thisArg); }
function DispatchFooCall() { DispatchCall(Foo, {}); }
DispatchCall(function(){});
DispatchCall(function(){}, []);
DispatchFooCall();
DispatchFooCall();
DispatchFooCall();

// test inlining of callback.apply
function DispatchApply(callback, thisArg) { callback.apply(thisArg); }
function DispatchBarApply() { DispatchApply(Bar, {}); }
DispatchApply(function(){});
DispatchApply(function(){}, []);
DispatchBarApply();
DispatchBarApply();
DispatchBarApply();
