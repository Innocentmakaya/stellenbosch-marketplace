const PaymentCancel = () => {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Payment Canceled 😞</h1>
        <p>Your payment was not completed.</p>
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
      color: "#f44336",
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
  
  export default PaymentCancel;
  