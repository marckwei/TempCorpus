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

// https://github.com/Microsoft/ChakraCore/issues/1340
function testForInInitializer() {
    try {
        eval('(function () { "use strict"; for (var i = 0 in { }) { } })');
        print('testForInInitializer strict: failure: did not throw');
    } catch (e) {
        var m = '' + e;
        var result = m === 'SyntaxError: for-in loop head declarations cannot have an initializer' ? 'success' : 'failure';
        print('testForInInitializer strict: ' + result + ': e = ' + m);
    }

    try {
        var f = eval('(function () { for (var i = 0 in { }) { } return i; })');
        var i = f();
        var result = i === 0 ? 'success' : 'failure';
        print('testForInInitializer non-strict: ' + result + ': i = ' + i);
    } catch (e) {
        print('testForInInitializer non-strict: failure: e = ' + e);
    }
}
testForInInitializer();

// regress WOOB 1143623
function find(arr, value) {
    var result = -1;

    for(var i in arr)
    {
        echo("enumerated index:", i);
        if(arr[i] == value)
        {
            result = i;
            break;
        }
    }
    return result;
}

var arr = [0, 1, 2, 3, 4, 5];
echo("Find 3 at index: ", find(arr, 3));

function propCacheTest()
{
   var obj = new Object();
   for (var i = 0; i < 10; i++)
   {
        obj["randomprop" + i] = i;
   }
    var propArray = new Array();
    for (var prop in obj)
    {
        propArray[propArray.length] = prop;
    }
    for (var prop in Array)
    {
    }
    obj = null;
    return propArray;
}

var props = propCacheTest();
CollectGarbage();

for (var i = 0; i < props.length; i++)
{
    echo(props[i]);
}
