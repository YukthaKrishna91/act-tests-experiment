# WebAssembly Test Suite

This test suite verifies WebAssembly (WASM) support as required by the BBC Streamlined Specification.

## Reference Documents

| ID                            | Title                            | Date        | URL                                                                                                                    |
| ----------------------------- | -------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| WASM-CORE                     | WebAssembly Core Specification   | 30 Nov 2024 | https://www.w3.org/TR/2024/WD-wasm-core-2-20241130/                                                                    |
| WASM-JS-API                   | WebAssembly JavaScript Interface | 30 Nov 2024 | https://www.w3.org/TR/2024/WD-wasm-js-api-2-20241130/                                                                  |
| WASM-WEB-API                  | WebAssembly Web API              | 30 Nov 2024 | https://www.w3.org/TR/2024/WD-wasm-web-api-2-20241130/                                                                 |
| WASM-EXT-CONSTANT-EXPRESSIONS | Extended Constant Expressions    | 30 Nov 2024 | https://github.com/WebAssembly/spec/blob/efa215847ede578fca9d2ad83cdd45a3ca61879e/proposals/extended-const/Overview.md |
| WASM-LIME-SERIES              | The Lime Series                  | -           | https://github.com/WebAssembly/tool-conventions/blob/main/Lime.md                                                      |

## Test Categories

### WebAssembly JavaScript API Tests

These tests verify the JavaScript API for interacting with WebAssembly modules.

| Test                                                      | Description                            | Specification |
| --------------------------------------------------------- | -------------------------------------- | ------------- |
| [wasm-validate](./wasm-validate/)                         | `WebAssembly.validate()` function      | WASM-JS-API   |
| [wasm-compile](./wasm-compile/)                           | `WebAssembly.compile()` function       | WASM-JS-API   |
| [wasm-instantiate-bytes](./wasm-instantiate-bytes/)       | `WebAssembly.instantiate()` with bytes | WASM-JS-API   |
| [wasm-module-constructor](./wasm-module-constructor/)     | `WebAssembly.Module` constructor       | WASM-JS-API   |
| [wasm-instance-constructor](./wasm-instance-constructor/) | `WebAssembly.Instance` constructor     | WASM-JS-API   |
| [wasm-memory-constructor](./wasm-memory-constructor/)     | `WebAssembly.Memory` constructor       | WASM-JS-API   |
| [wasm-memory-grow](./wasm-memory-grow/)                   | `WebAssembly.Memory.prototype.grow()`  | WASM-JS-API   |
| [wasm-table-constructor](./wasm-table-constructor/)       | `WebAssembly.Table` constructor        | WASM-JS-API   |
| [wasm-global-i32](./wasm-global-i32/)                     | `WebAssembly.Global` with i32          | WASM-JS-API   |
| [wasm-global-mutable](./wasm-global-mutable/)             | `WebAssembly.Global` with mutable flag | WASM-JS-API   |

### WebAssembly Web API Tests

These tests verify the streaming APIs for loading WebAssembly modules over the network.

| Test                                                        | Description                                   | Specification |
| ----------------------------------------------------------- | --------------------------------------------- | ------------- |
| [wasm-compile-streaming](./wasm-compile-streaming/)         | `WebAssembly.compileStreaming()` function     | WASM-WEB-API  |
| [wasm-instantiate-streaming](./wasm-instantiate-streaming/) | `WebAssembly.instantiateStreaming()` function | WASM-WEB-API  |

### WebAssembly Core Feature Tests

These tests verify core WebAssembly language features.

| Test                                                          | Description                                       | Specification    |
| ------------------------------------------------------------- | ------------------------------------------------- | ---------------- |
| [wasm-mutable-globals](./wasm-mutable-globals/)               | Mutable global state                              | WASM-CORE        |
| [wasm-multivalue](./wasm-multivalue/)                         | Functions returning multiple values               | WASM-CORE        |
| [wasm-sign-extension](./wasm-sign-extension/)                 | Sign extension operators                          | WASM-CORE        |
| [wasm-nontrapping-fptoint](./wasm-nontrapping-fptoint/)       | Non-trapping float-to-int conversions             | WASM-CORE        |
| [wasm-bulk-memory](./wasm-bulk-memory/)                       | Bulk memory operations (memory.fill, memory.copy) | WASM-CORE        |
| [wasm-call-indirect-overlong](./wasm-call-indirect-overlong/) | Overlong LEB128 immediate in call_indirect        | WASM-LIME-SERIES |

### Extended Constant Expressions

| Test                                          | Description                   | Specification                 |
| --------------------------------------------- | ----------------------------- | ----------------------------- |
| [wasm-extended-const](./wasm-extended-const/) | Computed constant expressions | WASM-EXT-CONSTANT-EXPRESSIONS |

### BigInt/i64 Integration Tests

These tests verify JavaScript BigInt integration for 64-bit integers.

| Test                                  | Description                 | Specification |
| ------------------------------------- | --------------------------- | ------------- |
| [wasm-i64-return](./wasm-i64-return/) | i64 return values as BigInt | WASM-JS-API   |
| [wasm-i64-param](./wasm-i64-param/)   | i64 parameters from BigInt  | WASM-JS-API   |
| [wasm-i64-global](./wasm-i64-global/) | i64 globals with BigInt     | WASM-JS-API   |

## Building WASM Modules

Each test folder contains its own WebAssembly text-format source (a `.wat` file, or a `.wast` file for the binary-form `call_indirect` overlong-immediate test) alongside its `module.wasm`. Assembling the modules requires [wabt](https://github.com/WebAssembly/wabt):

- `wat2wasm` for `.wat` sources
- `wast2json` for the `.wast` source (binary modules)
- Optional: `wasm-strip` for smaller binaries

On macOS: `brew install wabt`.

### Build

```bash
npm run build:wasm
```

This walks every `wasm-*` test folder, assembles the source into `module.wasm`, and verifies that any `.wat` files duplicated across folders (e.g. `add.wat`, `empty.wat`) are byte-identical so they cannot drift.

### Shared sources

A few `.wat` files are intentionally duplicated where multiple tests need the same module shape; the build script enforces that the copies stay identical.

| Source file | Used by tests                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------- |
| `add.wat`   | wasm-compile, wasm-compile-streaming, wasm-instantiate-bytes, wasm-instantiate-streaming, wasm-instance-constructor |
| `empty.wat` | wasm-module-constructor, wasm-validate                                                                              |
