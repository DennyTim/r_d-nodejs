export const validateQueryParams = schema => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    return res
      .status(400)
      .json({
        errors: result.error.errors.map(err => ({
          param: err.path.join("."),
          message: err.message
        })),
        where: "params"
      });
  }

  req.queryParams = result.data;
  next();
};
