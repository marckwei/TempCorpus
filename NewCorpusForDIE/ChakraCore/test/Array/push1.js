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

function write(v) { WScript.Echo(v); }

var n = 5;

function InitObject(obj) {
    for (var i=0; i<n; i++) {
        obj[i] = i * i + 1;
    }
    obj.length = n;

    return obj;
}

function TestPush(obj) {
    write(">>> Start push test for object: " + obj);

    var ret;
    ret = Array.prototype.push.call(obj);
    write("Returned:" + ret + " obj.length:" + obj.length);

    ret = Array.prototype.push.call(obj, "");
    write("Returned:" + ret + " obj.length:" + obj.length);

    ret = Array.prototype.push.call(obj, undefined);
    write("Returned:" + ret + " obj.length:" + obj.length);

    ret = Array.prototype.push.call(obj, 100);
    write("Returned:" + ret + " obj.length:" + obj.length);

    ret = Array.prototype.push.call(obj, 1, 2);
    write("Returned:" + ret + " obj.length:" + obj.length);

    ret = Array.prototype.push.call(obj, 1, 2, 3, 4, 5);
    write("Returned:" + ret + " obj.length:" + obj.length);

    write("<<< Stop push test for object: " + obj);
}

var testList = new Array(new Array() , new Object());
for (var i=0;i<testList.length;i++) {
    TestPush(InitObject(testList[i]));
}

TestPush({}); // behavior varies by version

function bar()
{
    var n = Number();
    Number.prototype.push = Array.prototype.push;
    n.push(1);
}
bar();
