function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

function noInline() {
}

function OSRExit() {
}

function ensureArrayStorage() {
}

function fiatInt52(i) {
	return i;
}

function noDFG() {
}

function noOSRExitFuzzing() {
}

function isFinalTier() {
	return true;
}

function transferArrayBuffer() {
}

function fullGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function edenGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function forceGCSlowPaths() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function noFTL() {

}

function debug(x) {
	console.log(x);
}

function describe(x) {
	console.log(x);
}

function isInt32(i) {
	return (typeof i === "number");
}

function BigInt(i) {
	return i;
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

//@ if $memoryLimited then skip else requireOptions("--verifyGC=0") end
import * as assert from '../assert.js';
import Builder from '../Builder.js';

{
    const $1 = new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 0, maximum: 0, element: "externref"})
                .Table({initial: 20, maximum: 30, element: "externref"})
          .End()
          .Export()
              .Function("set_tbl")
              .Function("get_tbl")
              .Function("get_tbl0")
              .Function("set_tbl0")
              .Table("tbl", 1)
          .End()
          .Code()
            .Function("set_tbl", { params: ["externref"], ret: "void" })
              .I32Const(0)
              .GetLocal(0)
              .TableSet(1)
            .End()

            .Function("get_tbl", { params: [], ret: "externref" })
              .I32Const(0)
              .TableGet(1)
            .End()

            .Function("get_tbl0", { params: [], ret: "externref" })
              .I32Const(0)
              .TableGet(0)
            .End()

            .Function("set_tbl0", { params: ["externref"], ret: "void" })
              .I32Const(0)
              .GetLocal(0)
              .TableSet(0)
            .End()
          .End().WebAssembly().get()));

    fullGC()

    assert.eq($1.exports.get_tbl(), null)

    $1.exports.set_tbl("hi")
    fullGC()
    assert.eq($1.exports.get_tbl(), "hi")
    assert.eq($1.exports.tbl.get(0), "hi")
    assert.eq($1.exports.tbl.get(1), null)

    assert.throws(() => $1.exports.get_tbl0(), Error, "Out of bounds table access (evaluating 'func(...args)')");
    assert.throws(() => $1.exports.set_tbl0(null), Error, "Out of bounds table access (evaluating 'func(...args)')");
}

{
    const tbl = new WebAssembly.Table({initial:0, element:"externref"});
    const $1 = new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Import()
                .Table("imp", "tbl", {initial: 0, element: "externref"})
          .End()
          .Function().End()
          .Table()
                .Table({initial: 20, maximum: 30, element: "externref"})
          .End()
          .Export()
              .Function("set_tbl")
              .Function("get_tbl")
              .Function("get_tbl0")
              .Function("set_tbl0")
              .Table("tbl", 1)
          .End()
          .Code()
            .Function("set_tbl", { params: ["externref"], ret: "void" })
              .I32Const(0)
              .GetLocal(0)
              .TableSet(1)
            .End()

            .Function("get_tbl", { params: [], ret: "externref" })
              .I32Const(0)
              .TableGet(1)
            .End()

            .Function("get_tbl0", { params: [], ret: "externref" })
              .I32Const(0)
              .TableGet(0)
            .End()

            .Function("set_tbl0", { params: ["externref"], ret: "void" })
              .I32Const(0)
              .GetLocal(0)
              .TableSet(0)
            .End()
          .End().WebAssembly().get()), { imp: { tbl }});

    fullGC()

    assert.eq($1.exports.get_tbl(), null)

    $1.exports.set_tbl("hi")
    fullGC()
    assert.eq($1.exports.get_tbl(), "hi")
    assert.eq($1.exports.tbl.get(0), "hi")
    assert.eq($1.exports.tbl.get(1), null)

    assert.throws(() => $1.exports.get_tbl0(), Error, "Out of bounds table access (evaluating 'func(...args)')");
    assert.throws(() => $1.exports.set_tbl0(null), Error, "Out of bounds table access (evaluating 'func(...args)')");
}

{
    const tbl = new WebAssembly.Table({initial:1, element:"externref"});
    const $1 = new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Import()
                .Table("imp", "tbl", {initial: 1, element: "externref"})
          .End()
          .Function().End()
          .Table()
                .Table({initial: 20, maximum: 30, element: "externref"})
          .End()
          .Export()
              .Function("set_tbl")
              .Function("get_tbl")
              .Function("get_tbl0")
              .Function("set_tbl0")
              .Table("tbl", 1)
          .End()
          .Code()
            .Function("set_tbl", { params: ["externref"], ret: "void" })
              .I32Const(0)
              .GetLocal(0)
              .TableSet(1)
            .End()

            .Function("get_tbl", { params: [], ret: "externref" })
              .I32Const(0)
              .TableGet(1)
            .End()

            .Function("get_tbl0", { params: [], ret: "externref" })
              .I32Const(0)
              .TableGet(0)
            .End()

            .Function("set_tbl0", { params: ["externref"], ret: "void" })
              .I32Const(0)
              .GetLocal(0)
              .TableSet(0)
            .End()
          .End().WebAssembly().get()), { imp: { tbl }});

    fullGC()

    assert.eq($1.exports.get_tbl(), null)

    $1.exports.set_tbl("hi")
    fullGC()
    $1.exports.set_tbl0(null)
    assert.eq($1.exports.get_tbl(), "hi")
    assert.eq($1.exports.get_tbl0(), null)
    assert.eq($1.exports.tbl.get(0), "hi")
    assert.eq($1.exports.tbl.get(1), null)
    assert.eq(tbl.get(0), null)
}

{
    const $1 = new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 3, maximum: 30, element: "funcref"})
                .Table({initial: 2, maximum: 30, element: "funcref"})
          .End()
          .Export()
              .Function("call_tbl0")
              .Function("call_tbl1")
              .Function("ret42")
              .Function("ret1337")
              .Function("ret256")
          .End()
          .Element()
                .Element({tableIndex: 1, offset: 0, functionIndices: [2]})
          .End()
          .Code()
            .Function("call_tbl0", { params: ["i32"], ret: "i32" })
              .GetLocal(0)
              .CallIndirect(1,0)
            .End()

            .Function("call_tbl1", { params: ["i32"], ret: "i32" })
              .GetLocal(0)
              .CallIndirect(1,1)
            .End()

            .Function("ret42", { params: [], ret: "i32" })
              .I32Const(42)
            .End()

            .Function("ret1337", { params: [], ret: "i32" })
              .I32Const(1337)
            .End()

            .Function("ret256", { params: [], ret: "i32" })
              .I32Const(256)
            .End()
          .End().WebAssembly().get()));

    fullGC()

    assert.eq($1.exports.call_tbl1(0), 42)
    assert.throws(() => $1.exports.call_tbl0(0), Error, "call_indirect to a null table entry (evaluating 'func(...args)')")
    assert.throws(() => $1.exports.call_tbl1(1), Error, "call_indirect to a null table entry (evaluating 'func(...args)')")
}

{
    const $1 = new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 3, maximum: 30, element: "funcref"})
                .Table({initial: 2, maximum: 30, element: "funcref"})
          .End()
          .Export()
              .Function("call_tbl0")
              .Function("call_tbl1")
              .Function("ret42")
              .Function("ret1337")
              .Function("ret256")
          .End()
          .Element()
                .Element({tableIndex: 1, offset: 0, functionIndices: [2]})
                .Element({tableIndex: 0, offset: 0, functionIndices: [3]})
                .Element({tableIndex: 1, offset: 1, functionIndices: [4]})
          .End()
          .Code()
            .Function("call_tbl0", { params: ["i32"], ret: "i32" })
              .GetLocal(0)
              .CallIndirect(1,0)
            .End()

            .Function("call_tbl1", { params: ["i32"], ret: "i32" })
              .GetLocal(0)
              .CallIndirect(1,1)
            .End()

            .Function("ret42", { params: [], ret: "i32" })
              .I32Const(42)
            .End()

            .Function("ret1337", { params: [], ret: "i32" })
              .I32Const(1337)
            .End()

            .Function("ret256", { params: [], ret: "i32" })
              .I32Const(256)
            .End()
          .End().WebAssembly().get()));

    fullGC()

    assert.eq($1.exports.call_tbl1(0), 42)
    assert.eq($1.exports.call_tbl0(0), 1337)
    assert.eq($1.exports.call_tbl1(1), 256)
    assert.throws(() => $1.exports.call_tbl0(1), Error, "call_indirect to a null table entry (evaluating 'func(...args)')")
    assert.throws(() => $1.exports.call_tbl0(2), Error, "call_indirect to a null table entry (evaluating 'func(...args)')")
    assert.throws(() => $1.exports.call_tbl1(2), Error, "Out of bounds call_indirect (evaluating 'func(...args)')")
}
 assert.throws(() => new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 3, maximum: 3, element: "funcref"})
                .Table({initial: 2, maximum: 2, element: "funcref"})
          .End()
          .Element()
                .Element({tableIndex: 1, offset: 0, functionIndices: [0]})
                .Element({tableIndex: 0, offset: 0, functionIndices: [0]})
                .Element({tableIndex: 1, offset: 2, functionIndices: [0]})
          .End()
          .Code()
            .Function("ret42", { params: [], ret: "i32" })
              .I32Const(42)
            .End()
          .End().WebAssembly().get())), Error, "Element is trying to set an out of bounds table index (evaluating 'new WebAssembly.Instance')")

assert.throws(() => new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 3, maximum: 3, element: "externref"})
                .Table({initial: 2, maximum: 3, element: "funcref"})
          .End()
          .Element()
                .Element({tableIndex: 1, offset: 0, functionIndices: [0]})
                .Element({tableIndex: 0, offset: 0, functionIndices: [0]})
                .Element({tableIndex: 1, offset: 2, functionIndices: [0]})
          .End()
          .Code()
            .Function("ret42", { params: [], ret: "i32" })
              .I32Const(42)
            .End()
          .End().WebAssembly().get())), Error, "WebAssembly.Module doesn't parse at byte 42: Table 0 must have type 'Funcref' to have an element section (evaluating 'new WebAssembly.Module')")

assert.throws(() => new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 3, maximum: 3, element: "externref"})
                .Table({initial: 2, maximum: 3, element: "funcref"})
          .End()
          .Code()
            .Function("fun", { params: [], ret: "externref" })
              .I32Const(0)
              .TableGet(2)
            .End()
          .End().WebAssembly().get())), Error, "WebAssembly.Module doesn't validate: table index 2 is invalid, limit is 2, in function at index 0 (evaluating 'new WebAssembly.Module')")

assert.throws(() => new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 3, maximum: 3, element: "externref"})
                .Table({initial: 2, maximum: 3, element: "funcref"})
          .End()
          .Code()
            .Function("fun", { params: [], ret: "void" })
              .I32Const(0)
              .RefNull("externref")
              .TableSet(2)
            .End()
          .End().WebAssembly().get())), Error, "WebAssembly.Module doesn't validate: table index 2 is invalid, limit is 2, in function at index 0 (evaluating 'new WebAssembly.Module')")

assert.throws(() => new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 3, maximum: 3, element: "externref"})
                .Table({initial: 2, maximum: 3, element: "funcref"})
          .End()
          .Code()
            .Function("fun", { params: [], ret: "void" })
              .CallIndirect(0, 2)
            .End()
          .End().WebAssembly().get())), Error, "WebAssembly.Module doesn't parse at byte 4: call_indirect's table index 2 invalid, limit is 2, in function at index 0 (evaluating 'new WebAssembly.Module')")

assert.throws(() => new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 3, maximum: 3, element: "externref"})
                .Table({initial: 2, maximum: 3, element: "funcref"})
          .End()
          .Code()
            .Function("fun", { params: [], ret: "void" })
              .CallIndirect(0,0)
            .End()
          .End().WebAssembly().get())), Error, "WebAssembly.Module doesn't parse at byte 4: call_indirect is only valid when a table has type funcref, in function at index 0 (evaluating 'new WebAssembly.Module')")

assert.throws(() => new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 3, maximum: 3, element: "externref"})
                .Table({initial: 2, maximum: 3, element: "funcref"})
          .End()
          .Code()
            .Function("fun", { params: [], ret: "void" })
              .RefNull("funcref")
              .TableGet(0)
            .End()
          .End().WebAssembly().get())), Error, "WebAssembly.Module doesn't validate: table.get index to type Funcref expected I32, in function at index 0 (evaluating 'new WebAssembly.Module')")


assert.throws(() => new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 3, maximum: 3, element: "externref"})
                .Table({initial: 2, maximum: 3, element: "funcref"})
          .End()
          .Code()
            .Function("fun", { params: [], ret: "void" })
              .RefNull("funcref")
              .RefNull("funcref")
              .TableSet(0)
            .End()
          .End().WebAssembly().get())), Error, "WebAssembly.Module doesn't validate: table.set index to type Funcref expected I32, in function at index 0 (evaluating 'new WebAssembly.Module')")

assert.throws(() => new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 3, maximum: 3, element: "externref"})
                .Table({initial: 2, maximum: 3, element: "funcref"})
          .End()
          .Code()
            .Function("fun", { params: ["externref"], ret: "void" })
              .I32Const(0)
              .GetLocal(0)
              .TableSet(1)
            .End()
          .End().WebAssembly().get())), Error, "WebAssembly.Module doesn't validate: table.set value to type Externref expected Funcref, in function at index 0 (evaluating 'new WebAssembly.Module')")

if (!$vm.isMemoryLimited()) {
    function tableInsanity(num, b) {
        b = b.Import()
        for (let i=0; i < 100000 - 1; ++i)
            b = b.Function("imp", "ref", { params: [], ret: "void" })
        b = b.End().Function().End().Table()
        for (let i=0; i<num; ++i)
            b = b.Table({initial: 0, maximum: 3, element: "externref"})
        return b
    }

    assert.throws(() => new WebAssembly.Instance(new WebAssembly.Module(tableInsanity(1000000, (new Builder())
              .Type().End())
                    .Table({initial: 3, maximum: 3, element: "externref"})
              .End()
              .Code()
                .Function("fun", { params: ["externref"], ret: "void" })
                  .I32Const(0)
                  .GetLocal(0)
                  .TableSet(1)
                .End()
              .End().WebAssembly().get())), Error, "Table count of 1000000 is too big, maximum 1000000");

    {
        const largeNumber = 1000000;
        const $1 = new WebAssembly.Instance(new WebAssembly.Module(tableInsanity(largeNumber-2, (new Builder())
              .Type().End())
                    .Table({initial: 3, maximum: 3, element: "funcref"})
                    .Table({initial: 3, maximum: 3, element: "externref"})
              .End()
              .Export()
                    .Function("set_tbl")
                    .Function("get_tbl")
                    .Function("call")
              .End()
              .Element()
                    .Element({tableIndex: largeNumber-2, offset: 0, functionIndices: [0]})
              .End()
              .Code()
                .Function("set_tbl", { params: ["externref"], ret: "void" })
                  .I32Const(0)
                  .GetLocal(0)
                  .TableSet(largeNumber-1)
                .End()
                .Function("get_tbl", { params: [], ret: "externref" })
                  .I32Const(0)
                  .TableGet(largeNumber-1)
                .End()
                .Function("call", { params: [], ret: "void" })
                  .I32Const(0)
                  .CallIndirect(0, largeNumber-2)
                .End()
              .End().WebAssembly().get()), { imp: { ref: function () {} } })
        $1.exports.set_tbl("hi")
        assert.eq($1.exports.get_tbl(), "hi")
        $1.exports.call()
    }
}
