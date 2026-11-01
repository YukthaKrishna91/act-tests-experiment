(module
  (global $counter (mut i32) (i32.const 0))
  (func (export "increment")
    global.get $counter
    i32.const 1
    i32.add
    global.set $counter)
  (func (export "get") (result i32)
    global.get $counter))
