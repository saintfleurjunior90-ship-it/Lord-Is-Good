"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const CONFIG = require("../public/config.js");
const { computeTotals } = require("../public/js/pricing.js");

test("Pièce unitaire en livraison = 6,99 + 6,23 = 13,22", () => {
  const r = computeTotals(CONFIG, [{ id: "piece", qty: 1 }], "delivery");
  assert.equal(r.ok, true);
  assert.equal(r.subtotalCents, 699);
  assert.equal(r.shippingCents, 623);
  assert.equal(r.totalCents, 1322);
});

test("Petite boîte en livraison = 19,99 + 6,23", () => {
  const r = computeTotals(CONFIG, [{ id: "small-box", qty: 1 }], "delivery");
  assert.equal(r.totalCents, 1999 + 623);
});

test("Boîte familiale = 39,98, livraison gratuite", () => {
  const r = computeTotals(CONFIG, [{ id: "family-box", qty: 1 }], "delivery");
  assert.equal(r.shippingCents, 0);
  assert.equal(r.freeShipping, true);
  assert.equal(r.totalCents, 3998);
});

test("Boîte familiale + autres articles → livraison gratuite pour toute la commande", () => {
  const r = computeTotals(CONFIG, [{ id: "family-box", qty: 1 }, { id: "piece", qty: 2 }], "delivery");
  assert.equal(r.shippingCents, 0);
  assert.equal(r.totalCents, 3998 + 2 * 699);
});

test("Frais de livraison appliqués une seule fois par commande", () => {
  const r = computeTotals(CONFIG, [{ id: "small-box", qty: 2 }, { id: "piece", qty: 1 }], "delivery");
  assert.equal(r.shippingCents, 623);
});

test("Retrait = pas de frais de livraison", () => {
  const r = computeTotals(CONFIG, [{ id: "piece", qty: 1 }], "pickup");
  assert.equal(r.shippingCents, 0);
  assert.equal(r.totalCents, 699);
  assert.equal(r.freeShipping, false);
});

test("Prix envoyés par le client ignorés ; produits inconnus et quantités invalides refusés", () => {
  assert.equal(computeTotals(CONFIG, [{ id: "piece", qty: 1, price: 0.01 }], "delivery").subtotalCents, 699);
  assert.equal(computeTotals(CONFIG, [{ id: "fake", qty: 1 }], "delivery").ok, false);
  assert.equal(computeTotals(CONFIG, [{ id: "piece", qty: -1 }], "delivery").ok, false);
  assert.equal(computeTotals(CONFIG, [{ id: "piece", qty: 1.5 }], "delivery").ok, false);
  assert.equal(computeTotals(CONFIG, [{ id: "piece", qty: 999 }], "delivery").ok, false);
  assert.equal(computeTotals(CONFIG, [], "delivery").ok, false);
  assert.equal(computeTotals(CONFIG, [{ id: "piece", qty: 1 }], "drone").ok, false);
});
