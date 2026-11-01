export class PromiseController {
  #resolve;
  #reject;

  constructor() {
    function bindResolvers(resolve, reject) {
      this.#resolve = resolve;
      this.#reject = reject;
    }

    this.promise = new Promise(bindResolvers.bind(this));
  }

  resolve(value) {
    this.#resolve(value);
  }

  reject(reason) {
    this.#reject(reason);
  }
}
