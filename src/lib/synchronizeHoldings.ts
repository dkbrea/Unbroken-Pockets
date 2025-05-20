import { supabase } from '@/lib/supabase';
import yahooFinance from 'yahoo-finance2';

interface Holding {
  id: string;
  symbol: string;
  shares: number;
  cost_basis: number;
  account_id: string;
  [key: string]: any;
}

export async function synchronizeHoldings(userId: string) {
  try {
    // Fetch user's holdings from the database
    const { data: holdings, error } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Update market data for each holding
    const updatedHoldings = await Promise.all(
      (holdings as Holding[]).map(async (holding) => {
        try {
          const quote = await yahooFinance.quote(holding.symbol);
          
          // Calculate current value and gain/loss
          const currentValue = holding.shares * quote.regularMarketPrice;
          const gainLoss = currentValue - holding.cost_basis;
          const gainLossPercent = (gainLoss / holding.cost_basis) * 100;

          // Update holding with current market data
          const { error: updateError } = await supabase
            .from('holdings')
            .update({
              current_price: quote.regularMarketPrice,
              current_value: currentValue,
              gain_loss: gainLoss,
              gain_loss_percent: gainLossPercent,
              last_updated: new Date().toISOString(),
            })
            .eq('id', holding.id);

          if (updateError) throw updateError;

          return {
            ...holding,
            current_price: quote.regularMarketPrice,
            current_value: currentValue,
            gain_loss: gainLoss,
            gain_loss_percent: gainLossPercent,
          };
        } catch (error) {
          console.error(`Error updating holding ${holding.symbol}:`, error);
          return holding;
        }
      })
    );

    return { holdings: updatedHoldings, error: null };
  } catch (error) {
    console.error('Error synchronizing holdings:', error);
    return { holdings: null, error };
  }
}

export default synchronizeHoldings;
