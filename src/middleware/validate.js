export const validate =
  (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((e) => e.message);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: errors,
        },
      });
    }
    req.body = result.data;
    next();
  };
