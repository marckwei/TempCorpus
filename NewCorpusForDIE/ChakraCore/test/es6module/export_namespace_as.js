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

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");


const tests = [
    {
        name: "Basic usage of export * as ns",
        body() {
            WScript.RegisterModuleSource("basicExport", 'export * as basic from "ModuleSimpleExport.js"');

            testRunner.LoadModule(
                `import {basic} from "basicExport";
                assert.areEqual(basic.ModuleSimpleExport_foo(), 'ModuleSimpleExport');`);
        }
    },
    {
        name: "Various valid exports via export * as ns",
        body() {
            WScript.RegisterModuleSource("variousExports", `
                export * as basic from "ModuleSimpleExport.js";
                export * as valid from "ValidExportStatements.js";
                export * as validReExports from "ValidReExportStatements.js";
                export * as complexReExports from "ModuleComplexReexports.js";
                `);
            
                testRunner.LoadModule(`
                function verifyPropertyDesc(obj, prop, desc, propName) {
                    var actualDesc = Object.getOwnPropertyDescriptor(obj, prop);
                    if (typeof propName === "undefined") { propName = prop; }
                    assert.areEqual(desc.configurable, actualDesc.configurable, propName+"'s attribute: configurable");
                    assert.areEqual(desc.enumerable, actualDesc.enumerable, propName+"'s attribute: enumerable");
                    assert.areEqual(desc.writable, actualDesc.writable, propName+"'s attribute: writable");
                }

                import {basic, valid as foo, validReExports as foo1} from "variousExports";

                assert.areEqual(basic.ModuleSimpleExport_foo(), 'ModuleSimpleExport');

                assert.areEqual("Module", foo[Symbol.toStringTag], "@@toStringTag is the String value'Module'");
                verifyPropertyDesc(foo, Symbol.toStringTag, {configurable:false, enumerable: false, writable: false}, "Symbol.toStringTag");
                verifyPropertyDesc(foo, "default", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "var7", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "var6", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "var4", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "var3", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "var2", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "var1", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "foo4", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "bar2", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "foobar", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "foo3", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "baz2", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "foo2", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "baz", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "bar", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "foo", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "const6", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "const5", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "const4", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "const3", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "const2", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "let7", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "let6", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "let5", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "let4", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "let2", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "let1", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "cl2", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "cl1", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "gn2", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "gn1", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "fn2", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo, "fn1", {configurable:false, enumerable: true, writable: true});
    
                verifyPropertyDesc(foo1, "foo", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo1, "bar", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo1, "baz", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo1, "foo2", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo1, "bar2", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo1, "foo3", {configurable:false, enumerable: true, writable: true});
    
                import {complexReExports as foo2} from "variousExports";
                verifyPropertyDesc(foo2, "ModuleComplexReexports_foo", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo2, "bar2", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo2, "localfoo2", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo2, "bar", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo2, "localfoo", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo2, "baz", {configurable:false, enumerable: true, writable: true});
                verifyPropertyDesc(foo2, "foo", {configurable:false, enumerable: true, writable: true});
            `);
        }
    },
    {
        name : "Re-exported namespace",
        body() {
            WScript.RegisterModuleSource("one",`
                export function foo () { return "foo"; }
                export function bar () { return "bar"; }
                export const boo = 5;
                `);
            WScript.RegisterModuleSource("two", `
                export const boo = 6;
                export function foo() { return "far"; }
                `);
            WScript.RegisterModuleSource("three", `
                export * as ns from "two";
                export * as default from "one";
                `);
            WScript.RegisterModuleSource("four", `
                export * from "three";
            `);
            testRunner.LoadModule(`
                import main from "three";
                import {ns} from "three";
                import * as Boo from "four";

                assert.areEqual(main.foo(), "foo");
                assert.areEqual(main.bar(), "bar");
                assert.areEqual(main.boo, 5);

                assert.areEqual(ns.foo(), "far");
                assert.areEqual(ns.boo, 6);
                assert.areEqual(Boo.ns, ns);
                assert.isUndefined(Boo.default);
            `);
        }
    }
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
