import { useState, useEffect } from "react";
import './PayFastTest.css';
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";

const PayFastTest = ({ amount, itemName }) => {
  // Sandbox Credentials
  const merchantId = "10037747";
  const merchantKey = "2ctp6k5hlt1xc";
  const sandboxUrl = "https://sandbox.payfast.co.za/eng/process";

  // URLs
  const returnUrl = "https://stellenbosch-marketplace.vercel.app/payment-success";
  const cancelUrl = "https://stellenbosch-marketplace.vercel.app/payment-cancel";
  const notifyUrl = "https://stellenbosch-marketplace.vercel.app/payfast-notify";

  // ✅ Fix Amount Format (e.g., 100.00)
  const formattedAmount = parseFloat(amount).toFixed(2);
  
  // ✅ Encode Item Name (avoids breaking special characters)
  const encodedItemName = encodeURIComponent(itemName);

  return (
    <form action={sandboxUrl} method="post" className="payfast-form">
      {/* PayFast Required Fields */}
      <input type="hidden" name="merchant_id" value={merchantId} />
      <input type="hidden" name="merchant_key" value={merchantKey} />
      <input type="hidden" name="return_url" value={returnUrl} />
      <input type="hidden" name="cancel_url" value={cancelUrl} />
      <input type="hidden" name="notify_url" value={notifyUrl} />
      
      {/* Payment Information */}
      <input type="hidden" name="amount" value={formattedAmount} />
      <input type="hidden" name="item_name" value={encodedItemName} />
      
      {/* Optional: Auto-select Payment Method (Credit Card, EFT, etc.) */}
      {/* <input type="hidden" name="payment_method" value="cc" /> */}

      {/* Payment Button */}
      <button type="submit" style={styles.button}>
        Proceed to Payment - R{formattedAmount}
      </button>
    </form>
  );
};

// Maroon theme button styling
const styles = {
  button: {
    padding: "14px 24px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#8b0000", // Stellenbosch Maroon
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(139, 0, 0, 0.3)",
    width: "100%",
    maxWidth: "300px",
    display: "block",
    margin: "0 auto",
  },
};

export default PayFastTest;
