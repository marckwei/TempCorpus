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

// native int array
var arr1 = [1, 2, 3, 4, 5];
arr1[arr1.length + 5] = 10;/**bp:evaluate('arr1[arr1.length + 3] == undefined')**/
WScript.Echo(arr1[arr1.length]); 

// native float array
var arr2 = [1, 2, 3, 4, 5];
arr1[arr2.length + 5] = 6.5;/**bp:evaluate('arr2[arr2.length + 3] == undefined')**/
WScript.Echo(arr1[arr2.length]); 

// native var array
var arr3 = [1, 2, 3, 4, 5];
arr3[arr3.length + 5] = arr1;/**bp:evaluate('arr3[arr3.length + 3] == undefined')**/
WScript.Echo(arr3[arr3.length]); 

// native float => var array
var arr4 = [1.3, 5.3, -0];
arr4[arr4.length + 5] = arr2;/**bp:evaluate('arr4[arr4.length + 3] == undefined');evaluate('arr4[2] == -0')**/
WScript.Echo(arr4[arr4.length]);

// native array with int and 0x80000002
var arr5 = [1, 4,5];
arr5[arr5.length + 5] = 0x80000002;/**bp:evaluate(' arr5[arr5.length + 3] == undefined');evaluate('arr5[arr5.length + 5] == 0x80000002')**/
WScript.Echo(arr5[arr5.length]); 

// native array with float and 0x80000002
var arr6 = [1.3, 3.4, 0x80000002];
arr6[arr6.length + 5] = -0;/**bp:evaluate('arr6[2] == 0x80000002');evaluate('arr6[arr6.length + 4] == undefined');evaluate('arr6[arr6.length + 5] == -0');**/
