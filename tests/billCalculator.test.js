const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateElectricityBill, TARIFF_CONFIG } = require('../billCalculator');
const app = require('../server');
const http = require('http');

test('Electricity Bill Calculation Suite', async (t) => {

  await t.test('Tier 1 (<= 100 units): 80 units @ domestic rate', () => {
    // 80 * 1.5 = 120, fixed: 50, tax: 120 * 0.05 = 6. Total = 176
    const res = calculateElectricityBill(80, 'domestic');
    assert.equal(res.unitsConsumed, 80);
    assert.equal(res.energyCharges, 120.00);
    assert.equal(res.fixedCharge, 50.00);
    assert.equal(res.taxAmount, 6.00);
    assert.equal(res.totalAmount, 176.00);
  });

  await t.test('Tier 2 (101 - 200 units): 150 units @ domestic rate', () => {
    // 100 * 1.5 = 150; 50 * 2.5 = 125. Energy = 275, fixed = 50, tax = 275 * 0.05 = 13.75. Total = 338.75
    const res = calculateElectricityBill(150, 'domestic');
    assert.equal(res.unitsConsumed, 150);
    assert.equal(res.energyCharges, 275.00);
    assert.equal(res.fixedCharge, 50.00);
    assert.equal(res.taxAmount, 13.75);
    assert.equal(res.totalAmount, 338.75);
  });

  await t.test('Tier 3 (201 - 300 units): 250 units @ domestic rate', () => {
    // 100 * 1.5 = 150; 100 * 2.5 = 250; 50 * 4.0 = 200. Energy = 600, fixed = 50, tax = 30. Total = 680
    const res = calculateElectricityBill(250, 'domestic');
    assert.equal(res.unitsConsumed, 250);
    assert.equal(res.energyCharges, 600.00);
    assert.equal(res.fixedCharge, 50.00);
    assert.equal(res.taxAmount, 30.00);
    assert.equal(res.totalAmount, 680.00);
  });

  await t.test('Tier 4 (> 300 units): 400 units @ domestic rate', () => {
    // 100 * 1.5 = 150; 100 * 2.5 = 250; 100 * 4.0 = 400; 100 * 6.0 = 600. Energy = 1400, fixed = 50, tax = 70. Total = 1520
    const res = calculateElectricityBill(400, 'domestic');
    assert.equal(res.unitsConsumed, 400);
    assert.equal(res.energyCharges, 1400.00);
    assert.equal(res.fixedCharge, 50.00);
    assert.equal(res.taxAmount, 70.00);
    assert.equal(res.totalAmount, 1520.00);
  });

  await t.test('Edge Case: Zero units consumed should bill only fixed charge', () => {
    const res = calculateElectricityBill(0, 'domestic');
    assert.equal(res.unitsConsumed, 0);
    assert.equal(res.energyCharges, 0);
    assert.equal(res.fixedCharge, 50.00);
    assert.equal(res.taxAmount, 0);
    assert.equal(res.totalAmount, 50.00);
  });

  await t.test('Commercial Connection: 150 units', () => {
    // Commercial: fixed = 120, tax = 9%
    // 100 * 3.0 = 300; 50 * 4.5 = 225. Energy = 525, tax = 525 * 0.09 = 47.25. Total = 525 + 120 + 47.25 = 692.25
    const res = calculateElectricityBill(150, 'commercial');
    assert.equal(res.connectionType, 'Commercial');
    assert.equal(res.energyCharges, 525.00);
    assert.equal(res.fixedCharge, 120.00);
    assert.equal(res.taxAmount, 47.25);
    assert.equal(res.totalAmount, 692.25);
  });

  await t.test('Validation: Rejects negative units', () => {
    assert.throws(() => {
      calculateElectricityBill(-25);
    }, /Invalid units/);
  });

  await t.test('Validation: Rejects non-numeric units', () => {
    assert.throws(() => {
      calculateElectricityBill('abc');
    }, /Invalid units/);
  });

  await t.test('API: /health returns HTTP 200 with UP status', async () => {
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;

    const res = await fetch(`http://127.0.0.1:${port}/health`);
    const json = await res.json();
    server.close();

    assert.equal(res.status, 200);
    assert.equal(json.status, 'UP');
  });

  await t.test('API: /api/calculate responds with full bill details', async () => {
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;

    const response = await fetch(`http://127.0.0.1:${port}/api/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Test User',
        meterNumber: 'MTR-123456',
        units: 200,
        connectionType: 'domestic'
      })
    });

    const data = await response.json();
    server.close();

    assert.equal(response.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.data.customerName, 'Test User');
    assert.equal(data.data.meterNumber, 'MTR-123456');
    assert.equal(data.data.unitsConsumed, 200);
  });
});
