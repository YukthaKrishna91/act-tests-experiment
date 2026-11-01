(module
  (func (export "trunc_f32") (param f32) (result i32)
    local.get 0
    i32.trunc_sat_f32_s)
  (func (export "trunc_f64") (param f64) (result i32)
    local.get 0
    i32.trunc_sat_f64_s))
