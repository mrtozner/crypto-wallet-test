import { validationResult } from 'express-validator';

const validate = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    const errorResponse = {
      code: 1000,
      message: 'VALIDATION_ERROR',
      errors: errorArray.map((err) => ({
        path: err.path,
        param: err.param,
        value: err.value,
        message: err.msg || `${err.path.toUpperCase()}_VALIDATION_ERROR`,
      })),
    };
    return res.status(422).json(errorResponse);
  }
  return next();
};

export default validate;
