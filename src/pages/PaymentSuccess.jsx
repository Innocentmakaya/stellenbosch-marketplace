const PaymentSuccess = () => {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Payment Successful 🎉</h1>
        <p>Your payment was processed successfully.</p>
        <a href="/" style={styles.button}>Go Back to Marketplace</a>
      </div>
    );
  };
  
  const styles = {
    container: {
      textAlign: "center",
      padding: "40px",
    },
    title: {
      color: "#28a745",
    },
    button: {
      marginTop: "20px",
      padding: "12px 20px",
      border: "none",
      borderRadius: "8px",
      backgroundColor: "#007bff",
      color: "white",
      textDecoration: "none",
      fontSize: "16px",
      cursor: "pointer",
    },
  };
  
  export default PaymentSuccess;
  