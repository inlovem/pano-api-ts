// import { User } from '../models'
// import { validateJWT } from '../utils/jwt';

// module.exports = (req, res, next) => {
// 	const token = req.header('Authorization');
// 	// console.log("Token: ", token);              // Ensure the token is present and valid
// 	// console.log("Request Method: ", req.method); // Log the HTTP method (GET, POST, etc.)
// 	// console.log("Request URL: ", req.originalUrl); // Log the full request URL
// 	// console.log("Request Headers: ", req.headers); // Log the headers to see the Authorization header and more
// 	// console.log("Request Body: ", req.body);    // Log the request body (for POST, PUT requests, etc.)
// 	// console.log("Request Params: ", req.params); // Log any URL parameters
// 	// console.log("Request Query: ", req.query);   // Log any query parameters (e.g., /endpoint?param=value)
// 	validateJWT(token)
// 		.then(({ payload/*, protectedHeader: { alg, kid }*/ }) => {
// 			req.user = User.fromCognitoUserData(payload);
// 			next();
// 		})
// 		.catch(e => {
// 			console.error('[401.0]', 'validateJWT failed with error:', e);
// 			res.jsonAPI({ status: 401 });
// 		});
// };

