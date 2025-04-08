const checkout = async (cid) => {
  let inputCart = document.getElementById("cartCheckout");
  cid = inputCart.value;
  try {
    let payload = await fetch(`/api/cart/${cid}/purchase`, {
      method: "post",
    });
    if (payload.status === 201) {
      let data = await payload.json();
      alert(data.message);
    }
    if (payload.status === 404) {
      let data = await payload.json();
      alert(data.message);
    }
    window.location.reload();
  } catch (error) {
    let errorData = {
      title: "Error checking out",
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    customLogger.error(JSON.stringify(errorData, null, 5));
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Unexpected server error - Try again later or contact admninistrator`,
    });
  }
};

const deleteProduct = async (pid) => {
  try {
    let inputCarrito = document.getElementById("cartCheckout");
    cid = inputCarrito.value;
    await fetch(`/api/cart/${cid}/product/${pid}`, {
        method: "delete",
      });
    window.location.reload();
  } catch (error) {
    let errorData = {
      title: "Error deleting product in cart",
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    customLogger.error(JSON.stringify(errorData, null, 5));
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Unexpected server error - Try again later or contact admninistrator`,
    });
  }
};

const emptyCart = async (cid) => {
  let inputCart = document.getElementById("cartCheckout");
  cid = inputCart.value;
  await fetch(`/api/cart/${cid}`, {
    method: "delete",
  });
  window.location.reload();

}
