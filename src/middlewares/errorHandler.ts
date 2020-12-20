import { Response } from 'express';

export const errorHandler = (err, req, res: Response, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
};
