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

// basic test of subarray with a begin index beyond the length of the typed array
WScript.Echo('var u8 = new Uint8Array(64); u8[63] = 45;');
var u8 = new Uint8Array(64);
u8[63] = 45;

WScript.Echo('u8[0] = ' + u8[0]);
WScript.Echo('u8[62] = ' + u8[62]);
WScript.Echo('u8[63] = ' + u8[63]);
WScript.Echo('u8[64] = ' + u8[64]);

u8 = u8.subarray(64); // 64 == length of the array, ie: u8[64] == undefined

WScript.Echo();
WScript.Echo('After u8.subarray(64).');

WScript.Echo('u8[0] = ' + u8[0]);
WScript.Echo('u8[62] = ' + u8[62]);
WScript.Echo('u8[63] = ' + u8[63]);
WScript.Echo('u8[64] = ' + u8[64]);

WScript.Echo();

// more exhaustive test
var size = 64;
var u8 = new Uint8Array(size);
for(i = 0; i < size; i++) {
    u8[i] = i;
}
for(i = ((size*-1)*2); i <= (size*2); i++) {
    var u9 = u8.subarray(i);

    var u9str = '';
    for(j = 0; j < u9.length; j++) {
        if(u9str != '') {
            u9str += ', ';
        }
        u9str += u9[j];
    }

    WScript.Echo('u8.subarray(' + i + ') = (' + u9.length + ') [' + u9str + ']');
}
