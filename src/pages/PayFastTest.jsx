const PayFastTest = ({ amount, itemName }) => {
  // Replace with your sandbox credentials
  const merchantId = "10037747";
  const merchantKey = "2ctp6k5hlt1xc";
  const sandboxUrl = "https://sandbox.payfast.co.za/eng/process";

  const returnUrl = "https://stellenbosch-marketplace.vercel.app/payment-success";
  const cancelUrl = "https://stellenbosch-marketplace.vercel.app/payment-cancel";
  const notifyUrl = "https://stellenbosch-marketplace.vercel.app/payfast-notify"; // ✅ Added this

  return (
    <form action={sandboxUrl} method="post">
      {/* PayFast Required Fields */}
      <input type="hidden" name="merchant_id" value={merchantId} />
      <input type="hidden" name="merchant_key" value={merchantKey} />
      <input type="hidden" name="return_url" value={returnUrl} />
      <input type="hidden" name="cancel_url" value={cancelUrl} />
      <input type="hidden" name="notify_url" value={notifyUrl} />

      {/* Payment Information */}
      <input type="hidden" name="amount" value={amount} />
      <input type="hidden" name="item_name" value={itemName} />

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
