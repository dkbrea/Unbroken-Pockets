// Import required modules
const fs = require('fs');
const path = require('path');

// Function to check if .babelrc exists and delete it
function removeBabelConfig() {
  const babelrcPath = path.join(process.cwd(), '.babelrc');
  
  try {
    // Check if .babelrc exists
    if (fs.existsSync(babelrcPath)) {
      console.log('Found .babelrc file. Removing...');
      
      // Delete the file
      fs.unlinkSync(babelrcPath);
      
      console.log('.babelrc has been successfully removed.');
    } else {
      console.log('No .babelrc file found.');
    }
    
    // Also check for babel.config.js
    const babelConfigPath = path.join(process.cwd(), 'babel.config.js');
    if (fs.existsSync(babelConfigPath)) {
      console.log('Found babel.config.js file. Removing...');
      fs.unlinkSync(babelConfigPath);
      console.log('babel.config.js has been successfully removed.');
    }
  } catch (error) {
    console.error('Error while checking/removing Babel configuration:', error);
  }
}

// Run the function
removeBabelConfig(); 