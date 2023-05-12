;; wat2wasm --enable-exceptions simple-inline-exception.wat -o simple-inline-exception.wasm
(module
  (tag $e (export "tag") (param i32))
  (memory $m 1)
  (func $inlinee
    i32.const 0
    (i32.and (i32.add (i32.load (i32.const 0)) (i32.const 1)) (i32.const 0x3))
    i32.store
    (throw $e (i32.const 1337))
  )
  (func $inliner (result i32) (result i32)
    (local $i i32)
    (local $sum i32)
    (local $sum2 i32)

    (loop $L0
      local.get $i
      i32.const 1
      i32.add
      local.set $i

      try
        call $inlinee
      catch $e
        local.get $sum2
        i32.add
        local.set $sum2

        i32.const 0
        i32.load
        local.get $sum
        i32.add
        local.set $sum
      end

      local.get $i
      i32.const 50
      i32.lt_s
      br_if $L0
    )

    local.get $sum
    local.get $sum2
  )
  (func $main (export "main")
    (local $i i32)
    (local $j i32)
    (i32.store (i32.const 0) (i32.const 0))
    (loop $L0
      local.get $i
      i32.const 1
      i32.add
      local.set $i

      call $inliner
      drop
      drop

      local.get $i
      i32.const 1000
      i32.lt_s
      br_if $L0
    )

    call $inliner
    local.set $j
    local.set $i

    local.get $j
    i32.const 66850
    i32.ne
    (if (then
      local.get $j
      throw $e
    ))

    i32.const 75
    local.get $i
    i32.ne
    (if (then
      local.get $i
      throw $e
    ))
  )
)
