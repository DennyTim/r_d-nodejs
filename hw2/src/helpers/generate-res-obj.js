export const generateResObj = (data) => new class {
  constructor(data) {
    this.data = data;
    this.error = null;
    this.statusMsg = "success";
    this.time = new Date().toISOString();
  }
}(data);
