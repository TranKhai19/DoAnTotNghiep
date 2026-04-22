const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1meW5jeXNkdWp4ZGVleXBwcGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjMxMjYsImV4cCI6MjA4ODg5OTEyNn0.0y77bgFmMNNF1pP_eAyciPEq7-EQB0MWUFPKpZmztAo';
const parts = jwt.split('.');
console.log(Buffer.from(parts[1], 'base64').toString('utf8'));
