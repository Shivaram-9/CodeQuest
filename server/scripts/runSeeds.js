const { spawn } = require('child_process');
const path = require('path');

console.log('Running database seed scripts...');

// Run the main seed script first
const seedProcess = spawn('node', [path.join(__dirname, 'seedDb.js')], {
  stdio: 'inherit'
});

seedProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('Main seed failed with code:', code);
    process.exit(code);
  }
  
  console.log('Main seed completed successfully.');
  console.log('Running additional problems seed...');
  
  // Then run the additional problems script
  const additionalProblemsProcess = spawn('node', [path.join(__dirname, 'additionalProblems.js')], {
    stdio: 'inherit'
  });
  
  additionalProblemsProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Additional problems seed failed with code:', code);
      process.exit(code);
    }
    
    console.log('All seed scripts completed successfully!');
    process.exit(0);
  });
}); 