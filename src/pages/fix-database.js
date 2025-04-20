import { useState } from 'react';
import { Button, Box, Text, Heading, Container, Stack, Alert, AlertIcon, Code, Spinner } from '@chakra-ui/react';

export default function FixDatabasePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runFix = async (endpoint) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Unknown error occurred');
      }
      
      setResult(data);
    } catch (err) {
      console.error('Error running database fix:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={6}>Database Fix Tool</Heading>
      
      <Stack spacing={4} direction="column" mb={8}>
        <Text>
          Use these buttons to run the database fix scripts that will:
        </Text>
        <Box pl={4}>
          <Text>• Create the accounts table if it doesn't exist</Text>
          <Text>• Add user_id column if it doesn't exist</Text>
          <Text>• Setup Row Level Security policies properly</Text>
        </Box>
        
        <Stack direction="row" spacing={4} mt={4}>
          <Button 
            colorScheme="blue" 
            onClick={() => runFix('fix-database')}
            isLoading={isLoading && !result && !error}
            loadingText="Running..."
            isDisabled={isLoading}
          >
            Run Standard Fix
          </Button>

          <Button 
            colorScheme="green" 
            onClick={() => runFix('direct-fix-alt')}
            isLoading={isLoading && !result && !error}
            loadingText="Running..."
            isDisabled={isLoading}
          >
            Run Alternative Fix (Hardcoded)
          </Button>
        </Stack>
      </Stack>

      {isLoading && (
        <Box textAlign="center" py={4}>
          <Spinner size="xl" />
          <Text mt={2}>Running database fix...</Text>
        </Box>
      )}

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {result && (
        <Box mt={4} p={4} borderWidth={1} borderRadius="md">
          <Heading size="md" mb={2}>Fix Result:</Heading>
          <Code p={4} borderRadius="md" w="100%" display="block" whiteSpace="pre-wrap">
            {JSON.stringify(result, null, 2)}
          </Code>
        </Box>
      )}
    </Container>
  );
} 