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

if (this.WScript && this.WScript.LoadScriptFile) { // Check for running in ch
    this.WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
}

var tests = [
   {
       name: "concat Bug",
       body: function ()
       {
            Array.prototype.length = 0;
            Array.prototype[0]="start";
            Array.prototype[1]="p1";
            Array.prototype[2]="p2";
            Array.prototype[3]="p3";
            Array.prototype[4]="p4";
            Array.prototype[5]="p5";
            Array.prototype[7]="p6";

            var arr = new Array();
            arr[3]="test";
            arr[4]=12;
            arr[6]=345;
            arr.concat(Array.prototype);

            delete Array.prototype[0];
            delete Array.prototype[3];
            delete Array.prototype[4];

            //Resulting Array from concat should look up the prototype
            assert.areEqual([,"p1","p2","test",12,"p5",345,"p6","p1","p2",,,"p5",,"p6"], arr.concat(Array.prototype));
       }
    },
    {
       name: "slice Bug",
       body: function ()
       {
            var retarr = new Array();
            var arr=new Array(2)
            arr[0]=0;
            Array.prototype[1]="p"+1;
            retarr[1]=arr;
            var result = retarr[1].slice(-2,2);
            for(var i=0;i<Array.prototype.length;i++)
            {
                delete Array.prototype[i];
            }
            assert.areEqual([0,undefined].toString(),retarr[1].toString());
       }
    }
];
testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });