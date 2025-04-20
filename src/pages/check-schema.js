import { useState, useEffect } from 'react';
import { Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td, Container, Code, Spinner, Alert, AlertIcon } from '@chakra-ui/react';

export default function CheckSchemaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSchema() {
      try {
        const response = await fetch('/api/check-schema');
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch schema');
        }
        
        setData(result);
      } catch (err) {
        console.error('Error fetching schema:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSchema();
  }, []);

  return (
    <Container maxW="container.lg" py={10}>
      <Heading mb={6}>Database Schema Information</Heading>

      {isLoading && (
        <Box textAlign="center" py={4}>
          <Spinner size="xl" />
          <Text mt={2}>Loading schema information...</Text>
        </Box>
      )}

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {data && (
        <>
          <Box mb={8}>
            <Heading size="md" mb={3}>Accounts Table Columns</Heading>
            {data.accounts_table_columns && data.accounts_table_columns.length > 0 ? (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Column Name</Th>
                    <Th>Data Type</Th>
                    <Th>Nullable</Th>
                    <Th>Default</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.accounts_table_columns.map((column, index) => (
                    <Tr key={index}>
                      <Td fontWeight={column.column_name === 'user_id' ? 'bold' : 'normal'}>
                        {column.column_name}
                      </Td>
                      <Td>{column.data_type}</Td>
                      <Td>{column.is_nullable}</Td>
                      <Td>
                        <Code fontSize="xs">{column.column_default || 'NULL'}</Code>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text>No columns found for accounts table</Text>
            )}
          </Box>

          {data.sample_data && data.sample_data.length > 0 && (
            <Box mb={8}>
              <Heading size="md" mb={3}>Sample Data (First 5 Rows)</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    {Object.keys(data.sample_data[0]).map(key => (
                      <Th key={key}>{key}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {data.sample_data.map((row, index) => (
                    <Tr key={index}>
                      {Object.values(row).map((value, valueIndex) => (
                        <Td key={valueIndex}>{value !== null ? String(value) : 'NULL'}</Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          {data.all_public_tables && (
            <Box>
              <Heading size="md" mb={3}>All Public Tables</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Table Name</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.all_public_tables.map((table, index) => (
                    <Tr key={index}>
                      <Td>{table.table_name}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </>
      )}
    </Container>
  );
} 