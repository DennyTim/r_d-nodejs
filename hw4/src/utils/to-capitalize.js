export function toCapitalize(str) {
  if (typeof str !== "string") {
    throw new TypeError("Expected a string");
  }
  return str.slice(0, 1).toUpperCase() + str.slice(1);
}
