const bodyParse = (req, callback) => {
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

export default bodyParse;
