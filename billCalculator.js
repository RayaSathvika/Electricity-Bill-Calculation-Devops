/**
 * Electricity Bill Calculation Engine
 * Calculates electricity charges using progressive slab pricing.
 */

const TARIFF_CONFIG = {
  domestic: {
    fixedCharge: 50.0,
    taxRate: 0.05, // 5% electricity duty
    slabs: [
      { maxUnits: 100, rate: 1.50, label: '0 - 100 units' },
      { maxUnits: 100, rate: 2.50, label: '101 - 200 units' },
      { maxUnits: 100, rate: 4.00, label: '201 - 300 units' },
      { maxUnits: Infinity, rate: 6.00, label: 'Above 300 units' }
    ]
  },
  commercial: {
    fixedCharge: 120.0,
    taxRate: 0.09, // 9% commercial duty
    slabs: [
      { maxUnits: 100, rate: 3.00, label: '0 - 100 units' },
      { maxUnits: 100, rate: 4.50, label: '101 - 200 units' },
      { maxUnits: 100, rate: 6.50, label: '201 - 300 units' },
      { maxUnits: Infinity, rate: 8.50, label: 'Above 300 units' }
    ]
  }
};

function calculateElectricityBill(units, connectionType = 'domestic', customerDetails = {}) {
  const parsedUnits = parseFloat(units);

  if (isNaN(parsedUnits) || parsedUnits < 0) {
    throw new Error('Invalid units: Units consumed must be a non-negative number.');
  }

  const type = (connectionType || 'domestic').toLowerCase();
  const config = TARIFF_CONFIG[type] || TARIFF_CONFIG.domestic;

  let remainingUnits = parsedUnits;
  let energyCharges = 0;
  const breakdown = [];

  for (const slab of config.slabs) {
    if (remainingUnits <= 0) {
      breakdown.push({
        slab: slab.label,
        rate: slab.rate,
        units: 0,
        amount: 0
      });
      continue;
    }

    const slabUnits = Math.min(remainingUnits, slab.maxUnits);
    const slabAmount = slabUnits * slab.rate;

    breakdown.push({
      slab: slab.label,
      rate: slab.rate,
      units: slabUnits,
      amount: parseFloat(slabAmount.toFixed(2))
    });

    energyCharges += slabAmount;
    remainingUnits -= slabUnits;
  }

  energyCharges = parseFloat(energyCharges.toFixed(2));
  const fixedCharge = config.fixedCharge;
  const taxAmount = parseFloat((energyCharges * config.taxRate).toFixed(2));
  const totalAmount = parseFloat((energyCharges + fixedCharge + taxAmount).toFixed(2));

  const billDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(billDate.getDate() + 15);

  return {
    customerName: customerDetails.name || 'Consumer',
    meterNumber: customerDetails.meterNumber || 'MTR-' + Math.floor(100000 + Math.random() * 900000),
    connectionType: type.charAt(0).toUpperCase() + type.slice(1),
    unitsConsumed: parsedUnits,
    breakdown,
    energyCharges,
    fixedCharge,
    taxRate: (config.taxRate * 100).toFixed(0) + '%',
    taxAmount,
    totalAmount,
    billDate: billDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    currency: 'INR (₹)'
  };
}

module.exports = {
  calculateElectricityBill,
  TARIFF_CONFIG
};

// If run directly from terminal CLI: node billCalculator.js <units> [type]
if (require.main === module) {
  const unitsArg = process.argv[2] !== undefined ? process.argv[2] : 250;
  const typeArg = process.argv[3] || 'domestic';

  try {
    const result = calculateElectricityBill(unitsArg, typeArg, { name: 'Demo Consumer', meterNumber: 'MTR-987654' });
    console.log('====================================================');
    console.log('         ELECTRICITY BILL SUMMARY');
    console.log('====================================================');
    console.log(`Consumer Name   : ${result.customerName}`);
    console.log(`Meter Number    : ${result.meterNumber}`);
    console.log(`Connection Type : ${result.connectionType}`);
    console.log(`Units Consumed  : ${result.unitsConsumed} kWh`);
    console.log('----------------------------------------------------');
    console.log('Slab Breakdown:');
    result.breakdown.forEach(b => {
      if (b.units > 0) {
        console.log(`  * ${b.slab.padEnd(18)} : ${b.units} units @ ₹${b.rate.toFixed(2)} = ₹${b.amount.toFixed(2)}`);
      }
    });
    console.log('----------------------------------------------------');
    console.log(`Energy Charges  : ₹${result.energyCharges.toFixed(2)}`);
    console.log(`Fixed Charges   : ₹${result.fixedCharge.toFixed(2)}`);
    console.log(`Duty / Tax (${result.taxRate}) : ₹${result.taxAmount.toFixed(2)}`);
    console.log('====================================================');
    console.log(`TOTAL PAYABLE   : ₹${result.totalAmount.toFixed(2)}`);
    console.log(`Due Date        : ${result.dueDate}`);
    console.log('====================================================');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
