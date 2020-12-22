import { Response } from 'express';

export const errorHandler = (err, req, res: Response, next) => {
  // Here I centralize all the errors returned to the end user.
  // We can control what to send in order to not expose our system's internals
  // To keep it simple I just send the message of the error without filtering
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
};
