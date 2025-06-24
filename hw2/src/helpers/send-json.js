export const sendJSON = (res, data, statusCode = 200) => {
  res.writeHead(statusCode, { "Content-type": "application/json" });
  res.end(JSON.stringify(data));
};
