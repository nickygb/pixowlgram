/**
 * This middleware will be the responsible to verify the signature of the JWT
 * tokens received from the authentication layer, and then must inject the
 * currentUser in the req object.
 *
 * For example if we choose to ahutenticate using AWS ALB + Cognito, then we will get
 * receive the following headers:
 *    x-amzn-oidc-accesstoken
 *    x-amzn-oidc-identity
 *    x-amzn-oidc-data
 *
 * TODO: Implement verification of signature ... now is dummy and inject a random
 * user into req obecjt
 */
export const authMiddleware = (req, res, next) => {
  req.currentUser = {
    id: Math.random() * (1000 - 1) + 1,
  };
  next();
};
