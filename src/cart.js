const COUPONS = {
  TACOS10: 10,
};

function createCart() {
  return { items: [], coupons: [] };
}

function addItem(cart, sku, price, qty) {
  cart.items.push({ sku, price, qty });
}

function applyCoupon(cart, code) {
  if (!(code in COUPONS)) {
    return false;
  }
  cart.coupons.push(code);
  return true;
}

function getTotal(cart) {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = cart.coupons.reduce((sum, code) => sum + COUPONS[code], 0);
  return subtotal - discount;
}

module.exports = { createCart, addItem, applyCoupon, getTotal };
