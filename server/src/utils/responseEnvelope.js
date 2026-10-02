export const sendSuccess = (res, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    ok: true,
    data
  });
};

export const sendError = (res, message = 'Internal Server Error', statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
  const payload = {
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };
  return res.status(statusCode).json(payload);
};
