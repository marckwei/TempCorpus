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

// -force:CopyOnAccessArray -testtrace:CopyOnAccessArray

function test ()
{
    var arr=[];
    arr[0]=[1,2,3,4,5];
    arr[1]=[1,2,3,4,5];
    arr[2]=[1,2,3,4,5];
    arr[3]=[1,2,3,4,5];
    arr[4]=[1,2,3,4,5];
    arr[5]=[1,2,3,4,5];
    arr[6]=[1,2,3,4,5];
    arr[7]=[1,2,3,4,5];
    arr[8]=[1,2,3,4,5];
    arr[9]=[1,2,3,4,5];
    arr[10]=[1,2,3,4,5];
    arr[11]=[1,2,3,4,5];
    arr[12]=[1,2,3,4,5];
    arr[13]=[1,2,3,4,5];
    arr[14]=[1,2,3,4,5];
    arr[15]=[1,2,3,4,5];
    arr[16]=[1,2,3,4,5];
    arr[17]=[1,2,3,4,5];
    arr[18]=[1,2,3,4,5];
    arr[19]=[1,2,3,4,5];
    arr[20]=[1,2,3,4,5];
    arr[21]=[1,2,3,4,5];
    arr[22]=[1,2,3,4,5];
    arr[23]=[1,2,3,4,5];
    arr[24]=[1,2,3,4,5];
    arr[25]=[1,2,3,4,5];
    arr[26]=[1,2,3,4,5];
    arr[27]=[1,2,3,4,5];
    arr[28]=[1,2,3,4,5];
    arr[29]=[1,2,3,4,5];
    arr[30]=[1,2,3,4,5];
    arr[31]=[1,2,3,4,5];
    arr[32]=[1,2,3,4,5];
    arr[33]=[1,2,3,4,5];

    for (var i=0; i<32; i++)
    {
        arr[i][0]=0; // Conversion of copy-on-access array should be transparent
    }
}

test();

