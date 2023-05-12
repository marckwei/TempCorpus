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

function InitObject(obj, len, mult, putUndefined) {
    for (var i=0; i<n; i++) {
        if ((i % mult) == 0)
        {
            obj[i] = i * i + 1;
        }
        else
        {
            if (putUndefined)
            {
                obj[i] = undefined;
            }
        }
    }

    obj[len-1] = "last";
    obj.length = len;

    return obj;
}

function ToString(obj) {
    var str = "";
    for (var i=0; i<obj.length; i++)
        str += obj[i] + ",";

    return str + ":: Length: " + obj.length;
}

function TestReverse(obj) {
    write(">>> Start reverse test for object: " + obj);

    write("Before Orig: " + ToString(obj));

    var res = Array.prototype.reverse.call(obj);

    write("After  Orig: " + ToString(obj));
    write("Result     : " + ToString(res));

    write("<<< Stop reverse test for object: " + obj);
}

function Main(putUndefined) {
    var testList = new Array(new Array(), new Array(), new Array(), new Array(), new Array());
    for (var i=0;i<testList.length;i++) {
        TestReverse(InitObject(testList[i], n + i, i+1, putUndefined));
    }

    testList = new Array(new Object(), new Object(), new Object(), new Object(), new Object());
    for (var i=0;i<testList.length;i++) {
        TestReverse(InitObject(testList[i], n + i, i+1, putUndefined));
    }

    testList = new Array(new Number(10), new Number(10), new Number(10), new Number(10), new Number(10));
    for (var i=0;i<testList.length;i++) {
        TestReverse(InitObject(testList[i], n + i, i, putUndefined));
    }

    testList = new Array(new Boolean(false), new Boolean(false), new Boolean(false), new Boolean(false), new Boolean(false));
    for (var i=0;i<testList.length;i++) {
        TestReverse(InitObject(testList[i], n + i, i, putUndefined));
    }
}

function ProtoCheck() {
    Array.prototype[1]=12;
    var arr=new Array(2)
    write(arr.reverse())

    Object.prototype[1]=10;
    var o=new Object();
    o.length = 2;
    var o1 = Array.prototype.reverse.call(o);

    write(Array.prototype.join.call(o));
    write(Array.prototype.join.call(o1));
}

Main(false);
Main(true);

ProtoCheck();