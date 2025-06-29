export function errorHandler(err, req, res) {
  console.error(err);
  req.log.error({ err });

  res.status(err.status || 500).json({ error: err.message || "Server error" });
}
