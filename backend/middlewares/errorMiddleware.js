import * as errors from '../constant/errors.js';

const errorMiddleware = (err, req, res, next) => {
  if (errors[err.message]) {
    const { httpCode = 500, code, message } = errors[err.message];
    return res.status(httpCode).json({ code, message });
  }
  const errorMessage = err?.response?.data?.message || err.message;

  return res.status(500).json({ message: errorMessage });
};

export default errorMiddleware;
