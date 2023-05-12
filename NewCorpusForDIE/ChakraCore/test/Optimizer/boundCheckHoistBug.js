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

function opt(arr, index) {
    let s4 = 0;
    for (var t = 2; t < index; t++) {
        if (t >= 5)
            s4 += 32;
        else
            s4 += 66;
        arr[s4] = 4;
    }
}
ua = new Uint8Array(2457);
opt(ua, 16);
ua = new Uint8Array(128);
opt(ua, 4);

function opt2(arr, index) {
    let s4 = 0;
    for (var t = index - 1; t >= 2 ; t--) {
        if (t >= 5)
            s4 += 32;
        else
            s4 += 66;
        arr[s4] = 4;
    }
}
ua = new Uint8Array(2457);
opt2(ua, 16);
ua = new Uint8Array(128);
opt2(ua, 4);

function opt3(arr, index) {
    let s4 = 0;
    for (var t = 2; t < index; t++) {
        if (t >= 5)
            s4 += 1;
        arr[s4] = 4;
    }
}
ua = new Uint8Array(2457);
opt3(ua, 16);
ua = new Uint8Array(128);
opt3(ua, 4);


function opt4(arr, index) {
    let s4 = 1000;
    for (var t = 2; t < index; t++) {
        if (t < 5)
            s4 -= 100;
        else
            s4 -= 140;
        arr[s4] = 4;
        s4 += 100;
    }
}
ua = new Uint8Array(2457);
opt4(ua, 16);
ua = new Uint8Array(901);
opt4(ua, 50);

function opt5(arr, index) {
    let s4 = 0;
    for (var t = 2; t < index; t++) {
        if (t >= 5)
            s4 += 100;
        else
            s4 += 140;
        arr[s4] = 4;
        s4 -= 100;
    }
}
ua = new Uint8Array(2457);
opt5(ua, 16);
ua = new Uint8Array(100);
opt5(ua, 4);


function opt6(arr, index) {
    let s4 = 100;
    for (var t = 2; t < index; t++) {
        if (t >= 5)
            s4 -= 60;
        else
            s4 -= 40;
        arr[s4] = 4;
        s4 += 100;
    }
}
ua = new Uint8Array(2457);
opt6(ua, 16);
ua = new Uint8Array(100);
opt6(ua, 4);

print("Pass")