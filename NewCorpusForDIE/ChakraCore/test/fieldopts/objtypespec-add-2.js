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

(function test1() {
    WScript.Echo("Test1:");

    function SetUp() {
        Foo = function () { }
        Foo.prototype.a = 0;

        // This ensures that fields a and b are not marked as fixed on the path type handler shared
        // by all subsequent objects.  Thus add property caches can be populated and object type spec
        // will kick in.
        var dummy = new Foo();
        dummy.a = 0;
        dummy.b = 0;

        dummy.a = 0;
        dummy.b = 0;

        warmUpObj = new Foo();
        testObj = new Foo();
    }

    SetUp();

    function test(o) {
        // On the second iteration of this loop we will JIT the loop body.
        for (var i = 0; i < 2; i++) {
            o.a = 10;
            o.b = 20;
        }
    }

    test(warmUpObj);

    // Change the writable attribute without actually adding or deleting any properties.
    Object.defineProperty(Foo.prototype, "a", { writable: false });

    // Should bail out now on property guard check.
    test(testObj);

    var passed = testObj.a == Foo.prototype.a;
    WScript.Echo(passed ? "Passed" : "Failed");
    WScript.Echo();
})();

(function test2() {
    WScript.Echo("Test2:");

    function test0(objects) {
        // On the second iteration of this loop we will JIT the loop body.
        for (var i = 0; i < 2; i++) {
            if (i = 1) {
                makeReadOnly(MakeObject.prototype);
            }
            var o = objects[i];
            o.x = 1;
            o.y = 1;
            o.z = 1;
        }
    };

    function MakeObject() {
    }

    var p = {}
    MakeObject.prototype = p;

    function makeReadOnly(o) {
        Object.defineProperty(o, "x", { value: "0", writable: false });
    }

    var o = new MakeObject();
    o.x = 1;
    o.y = 1;
    o.z = 1;

    var objects = [new MakeObject(), new MakeObject()];
    test0(objects);

    var passed = objects[1].x == MakeObject.prototype.x;
    WScript.Echo(passed ? "Passed" : "Failed");
    WScript.Echo();
})();
