const mongoSanitize = require('express-mongo-sanitize');
console.log('Type:', typeof mongoSanitize);
console.log('Sanitize function:', typeof mongoSanitize.sanitize);
console.log('Keys:', Object.keys(mongoSanitize));
process.exit(0);
