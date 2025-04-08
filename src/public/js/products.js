const buy = async (pid) => {
  let inputCarrito = document.getElementById("cart");
  let cid = inputCarrito.value;
  let payload = await fetch(`/api/cart/${cid}/product/${pid}`, {
    method: "post",
  });
  if (payload.status === 200) {
    let data = await payload.json();
    alert("Product added...!!!");
  }
  if (payload.status === 401) {
    let data = await payload.json();
    alert(
      "Can't buy your own products... Doesn't make sense, ask Coderhouse why..."
    );
  }
};
