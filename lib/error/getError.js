// https://github.com/jest-community/eslint-plugin-jest/blob/v25.7.0/docs/rules/no-conditional-expect.md#how-to-catch-a-thrown-error-for-testing-without-violating-this-rule

class NoErrorThrownError extends Error {}

export async function getError(func) {
  try {
    await func();

    throw new NoErrorThrownError();
  } catch (error) {
    return error;
  }
}
