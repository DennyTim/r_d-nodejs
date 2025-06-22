export const generateError = (msg) => new class {
  constructor(msg) {
    this.data = null;
    this.error = msg;
    this.statusMsg = 'failed'
    this.time = new Date().toISOString();
  }
}(msg);
