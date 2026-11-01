;; Overlong `call_indirect` immediate from Reference Types (call-indirect-overlong).
;;
;; Encodes the table index immediate as a 4-byte LEB128 zero. A spec-compliant
;; engine MUST accept this; engines validating only canonical (1-byte) encodings
;; reject it. This module cannot be expressed as canonical .wat, so it is
;; provided as the binary form and assembled with `wast2json`.
;;
;; Source: https://github.com/WebAssembly/tool-conventions/blob/main/Lime.md
(module binary
  "\00asm" "\01\00\00\00" ;; magic header
  "\01\04"    ;; type section, 4 bytes
  "\01"       ;; 1 type
  "\60\00\00" ;; function type, no params, no results
  "\03\02"    ;; function section, 2 bytes
  "\01"       ;; 1 function
  "\00"       ;; function0 has type 0
  "\04\04"    ;; table section, 4 bytes
  "\01"       ;; 1 table
  "\70\00\01" ;; funcref table, no flags, min 1 element
  "\0a\0c"    ;; code section, 12 bytes
  "\01"       ;; 1 function
  "\0a"       ;; function is 10 bytes
  "\00"       ;; no locals
  "\41\00"    ;; i32.const 0

  ;; call_indirect opcode + (type 0) immediate
  "\11\00"

  ;; 4-byte encoding of the immediate 0, the table index for `call_indirect`
  "\80\80\80\00"

  "\0b"       ;; end
)
