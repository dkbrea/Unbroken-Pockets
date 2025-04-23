require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixInvestmentsData() {
  console.log('Checking and fixing investment portfolio data...');

  try {
    // First, get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    console.log(`Found ${users.length} users in the system.`);
    
    // For each user, check if they have a portfolio and create one if they don't
    for (const user of users) {
      console.log(`Checking portfolio for user: ${user.email} (${user.id})`);
      
      // Check if user has a portfolio
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('investment_portfolio')
        .select('*')
        .eq('user_id', user.id);
      
      if (portfolioError) {
        console.error(`Error checking portfolio for user ${user.id}:`, portfolioError);
        continue;
      }
      
      if (!portfolioData || portfolioData.length === 0) {
        console.log(`Creating default portfolio for user ${user.id}`);
        
        // Create a default portfolio
        const { data: newPortfolio, error: createError } = await supabase
          .from('investment_portfolio')
          .insert({
            total_value: 0,
            change_amount: 0,
            change_percentage: 0,
            user_id: user.id
          })
          .select();
        
        if (createError) {
          console.error(`Error creating portfolio for user ${user.id}:`, createError);
          continue;
        }
        
        console.log(`Successfully created portfolio for user ${user.id}:`, newPortfolio);
        
        // Create default time range performance records
        const timeRanges = ['1D', '1W', '1M', '1Y', 'All'];
        
        for (const range of timeRanges) {
          const { error: perfError } = await supabase
            .from('portfolio_performance')
            .insert({
              time_range: range,
              amount: 0,
              percentage: 0,
              portfolio_id: newPortfolio[0].id
            });
          
          if (perfError) {
            console.error(`Error creating performance record for range ${range}:`, perfError);
          }
        }
        
        console.log(`Created performance records for portfolio ${newPortfolio[0].id}`);
      } else {
        console.log(`User ${user.id} already has a portfolio: ${portfolioData[0].id}`);
        
        // Check if portfolio has performance records
        const { data: performanceData, error: perfError } = await supabase
          .from('portfolio_performance')
          .select('*')
          .eq('portfolio_id', portfolioData[0].id);
        
        if (perfError) {
          console.error(`Error checking performance data:`, perfError);
          continue;
        }
        
        if (!performanceData || performanceData.length === 0) {
          console.log(`Creating performance records for portfolio ${portfolioData[0].id}`);
          
          // Create default time range performance records
          const timeRanges = ['1D', '1W', '1M', '1Y', 'All'];
          
          for (const range of timeRanges) {
            const { error: perfError } = await supabase
              .from('portfolio_performance')
              .insert({
                time_range: range,
                amount: 0,
                percentage: 0,
                portfolio_id: portfolioData[0].id
              });
            
            if (perfError) {
              console.error(`Error creating performance record for range ${range}:`, perfError);
            }
          }
          
          console.log(`Created performance records for portfolio ${portfolioData[0].id}`);
        } else {
          console.log(`Portfolio ${portfolioData[0].id} already has ${performanceData.length} performance records`);
        }
      }
    }
    
    // Check if there are any asset allocation records and create defaults if none
    const { data: allocationData, error: allocationError } = await supabase
      .from('asset_allocation')
      .select('*');
    
    if (allocationError) {
      console.error('Error checking asset allocation:', allocationError);
    } else if (!allocationData || allocationData.length === 0) {
      console.log('Creating default asset allocation records');
      
      const defaultAllocation = [
        { name: 'US Stocks', value: 0, percentage: 60, color: 'bg-blue-500' },
        { name: 'International Stocks', value: 0, percentage: 15, color: 'bg-green-500' },
        { name: 'Bonds', value: 0, percentage: 15, color: 'bg-purple-500' },
        { name: 'Real Estate', value: 0, percentage: 5, color: 'bg-yellow-500' },
        { name: 'Alternative', value: 0, percentage: 5, color: 'bg-red-500' }
      ];
      
      for (const allocation of defaultAllocation) {
        const { error } = await supabase
          .from('asset_allocation')
          .insert(allocation);
        
        if (error) {
          console.error(`Error creating asset allocation for ${allocation.name}:`, error);
        }
      }
      
      console.log('Created default asset allocation records');
    } else {
      console.log(`Found ${allocationData.length} asset allocation records`);
    }
    
    console.log('Investment data fix complete!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
fixInvestmentsData()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 