export default {
  GET(req, res) {
    res.writeHead(200, { "Content-type": "text/plain" });
    res.end("test");
  }
};
