(module
  (memory (export "memory") 1)
  (func (export "fill") (param $dest i32) (param $val i32) (param $len i32)
    local.get $dest
    local.get $val
    local.get $len
    memory.fill)
  (func (export "copy") (param $dest i32) (param $src i32) (param $len i32)
    local.get $dest
    local.get $src
    local.get $len
    memory.copy))
