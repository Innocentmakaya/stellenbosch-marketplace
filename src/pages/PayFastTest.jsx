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
    <form action={sandboxUrl} method="post">
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
        Proceed to Payment
      </button>
    </form>
  );
};

// Simple button styling (optional)
const styles = {
  button: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#28a745",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.2s",
  },
};

export default PayFastTest;
