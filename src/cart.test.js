const assert = require("assert");
const { createCart, addItem, applyCoupon, getTotal } = require("./cart");

const normal = createCart();
addItem(normal, "TACO-XL", 8.9, 2);
applyCoupon(normal, "TACOS10");
assert.strictEqual(getTotal(normal).toFixed(2), "7.80", "Un code promo doit retirer 10 €");

const twice = createCart();
addItem(twice, "TACO-XL", 8.9, 2);
applyCoupon(twice, "TACOS10");
const secondTry = applyCoupon(twice, "TACOS10");
assert.strictEqual(secondTry, false, "Le même code promo ne doit être accepté qu'une fois");
assert.strictEqual(getTotal(twice).toFixed(2), "7.80", "Le total ne doit retirer la réduction qu'une fois");

console.log("Le panier est réparé : la boutique peut rouvrir !");
