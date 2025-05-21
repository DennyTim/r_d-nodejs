export const sendJSON = (res, data, statusCode = 200) => {
  res.writeHead(statusCode, { "Content-type": "application/json" });
  res.end(JSON.stringify(data));
};

export const parseBody = (req, callback) => {
  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", () => {
    try {
      if (body === "") {
        callback({});
      } else {
        callback(JSON.parse(body));
      }
    } catch (e) {
      console.log(e);
      callback({});
    }
  });
};
