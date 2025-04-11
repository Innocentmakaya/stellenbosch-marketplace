// This file should be deployed as a serverless function
// e.g., as an API route in Next.js, Vercel, or Netlify Functions

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PayFast configuration
const PAYFAST_MERCHANT_ID = process.env.REACT_APP_PAYFAST_MERCHANT_ID;
const PAYFAST_MERCHANT_KEY = process.env.REACT_APP_PAYFAST_MERCHANT_KEY;
const PRODUCTION_MODE = process.env.REACT_APP_PAYFAST_PRODUCTION === 'true';

// List of PayFast IP addresses (for validation)
const PAYFAST_IP_ADDRESSES = [
  '41.74.179.194',
  '41.74.179.195', 
  '41.74.179.196',
  '41.74.179.197',
  '41.74.179.198', 
  '41.74.179.199',
  '41.74.179.200', 
  '41.74.179.201',
  '41.74.179.202', 
  '41.74.179.203', 
  '41.74.179.204'
];

// For sandbox testing, allow localhost
if (!PRODUCTION_MODE) {
  PAYFAST_IP_ADDRESSES.push('127.0.0.1');
  PAYFAST_IP_ADDRESSES.push('::1');
}

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { body, headers, connection } = req;
    
    // Validate that the request is from PayFast
    const requestIP = headers['x-forwarded-for'] || connection.remoteAddress;
    
    if (!PAYFAST_IP_ADDRESSES.includes(requestIP) && PRODUCTION_MODE) {
      console.error(`Invalid request IP: ${requestIP}`);
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Extract data from the notification
    const { 
      m_payment_id, 
      pf_payment_id, 
      payment_status, 
      amount_gross, 
      amount_fee, 
      amount_net,
      item_name,
      custom_str1
    } = body;
    
    console.log('Payment notification received:', {
      m_payment_id,
      pf_payment_id,
      payment_status,
      amount_gross
    });
    
    // Extract listing ID from the payment ID format "listing-{id}-{timestamp}"
    let listingId = null;
    if (m_payment_id && m_payment_id.startsWith('listing-')) {
      const parts = m_payment_id.split('-');
      if (parts.length >= 3) {
        listingId = parts[1];
      }
    }
    
    // Validate payment status
    if (payment_status !== 'COMPLETE') {
      console.log(`Payment ${pf_payment_id} status: ${payment_status}`);
      // Store the incomplete payment status
      if (listingId) {
        await supabase
          .from('payments')
          .insert([{
            payment_id: pf_payment_id,
            m_payment_id,
            listing_id: listingId,
            status: payment_status,
            amount: amount_gross,
            fee: amount_fee,
            net_amount: amount_net,
            created_at: new Date().toISOString()
          }]);
      }
      return res.status(200).end();
    }
    
    // Payment was successful
    console.log(`Payment ${pf_payment_id} completed successfully`);
    
    // Store the payment in the database
    if (listingId) {
      // Update the listing as sold
      await supabase
        .from('listings')
        .update({ 
          status: 'sold',
          sold_at: new Date().toISOString() 
        })
        .eq('id', listingId);
      
      // Record the payment details
      await supabase
        .from('payments')
        .insert([{
          payment_id: pf_payment_id,
          m_payment_id,
          listing_id: listingId,
          status: 'COMPLETE',
          amount: amount_gross,
          fee: amount_fee,
          net_amount: amount_net,
          item_name,
          custom_data: custom_str1,
          created_at: new Date().toISOString()
        }]);
    }
    
    return res.status(200).end();
  } catch (error) {
    console.error('Error processing PayFast notification:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 