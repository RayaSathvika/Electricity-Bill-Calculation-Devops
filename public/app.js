document.addEventListener('DOMContentLoaded', () => {
  const billForm = document.getElementById('billForm');
  const customerNameInput = document.getElementById('customerName');
  const meterNumberInput = document.getElementById('meterNumber');
  const connectionTypeSelect = document.getElementById('connectionType');
  const unitsConsumedInput = document.getElementById('unitsConsumed');
  const presetButtons = document.querySelectorAll('.btn-preset');
  const resetBtn = document.getElementById('resetBtn');
  const printBtn = document.getElementById('printBtn');

  // Display elements
  const displayTotal = document.getElementById('displayTotal');
  const displayGrandTotal = document.getElementById('displayGrandTotal');
  const displayDueDate = document.getElementById('displayDueDate');
  const displayCustomer = document.getElementById('displayCustomer');
  const displayMeter = document.getElementById('displayMeter');
  const displayCategory = document.getElementById('displayCategory');
  const displayDate = document.getElementById('displayDate');
  const displayEnergyCharges = document.getElementById('displayEnergyCharges');
  const displayFixedCharge = document.getElementById('displayFixedCharge');
  const displayTaxRate = document.getElementById('displayTaxRate');
  const displayTaxAmount = document.getElementById('displayTaxAmount');
  const breakdownTableBody = document.getElementById('breakdownTableBody');
  const activeTariffLabel = document.getElementById('activeTariffLabel');
  const tariffTableBody = document.getElementById('tariffTableBody');
  const fixedChargeNote = document.getElementById('fixedChargeNote');

  // Tariff reference tables
  const tariffInfo = {
    domestic: {
      label: 'Domestic',
      slabs: [
        { slab: '0 – 100 units', rate: '₹1.50 / kWh' },
        { slab: '101 – 200 units', rate: '₹2.50 / kWh' },
        { slab: '201 – 300 units', rate: '₹4.00 / kWh' },
        { slab: 'Above 300 units', rate: '₹6.00 / kWh' }
      ],
      note: 'Fixed Meter Rent: ₹50.00 | Electricity Duty: 5%'
    },
    commercial: {
      label: 'Commercial',
      slabs: [
        { slab: '0 – 100 units', rate: '₹3.00 / kWh' },
        { slab: '101 – 200 units', rate: '₹4.50 / kWh' },
        { slab: '201 – 300 units', rate: '₹6.50 / kWh' },
        { slab: 'Above 300 units', rate: '₹8.50 / kWh' }
      ],
      note: 'Fixed Meter Rent: ₹120.00 | Electricity Duty: 9%'
    }
  };

  function updateTariffReference(type) {
    const config = tariffInfo[type] || tariffInfo.domestic;
    activeTariffLabel.textContent = config.label;
    fixedChargeNote.textContent = config.note;

    tariffTableBody.innerHTML = config.slabs
      .map(s => `<tr><td>${s.slab}</td><td>${s.rate}</td></tr>`)
      .join('');
  }

  connectionTypeSelect.addEventListener('change', () => {
    updateTariffReference(connectionTypeSelect.value);
    calculateBill();
  });

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      unitsConsumedInput.value = btn.dataset.units;
      calculateBill();
    });
  });

  resetBtn.addEventListener('click', () => {
    customerNameInput.value = 'Gunjan Nashine';
    meterNumberInput.value = 'EB-2026-9812';
    connectionTypeSelect.value = 'domestic';
    unitsConsumedInput.value = '250';
    updateTariffReference('domestic');
    calculateBill();
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });

  billForm.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateBill();
  });

  // Calculate bill function
  async function calculateBill() {
    const units = parseFloat(unitsConsumedInput.value);
    const connectionType = connectionTypeSelect.value;
    const customerName = customerNameInput.value.trim() || 'Consumer';
    const meterNumber = meterNumberInput.value.trim() || 'EB-2026-9812';

    if (isNaN(units) || units < 0) {
      alert('Please enter a valid non-negative number for units consumed.');
      return;
    }

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          units,
          connectionType,
          customerName,
          meterNumber
        })
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Failed to calculate bill');
      }

      renderInvoice(resData.data);
    } catch (err) {
      console.error('Calculation error:', err);
      // Fallback local calculation in case API is disconnected
      fallbackLocalCalculate(units, connectionType, customerName, meterNumber);
    }
  }

  function renderInvoice(bill) {
    displayTotal.textContent = `₹${bill.totalAmount.toFixed(2)}`;
    displayGrandTotal.textContent = `₹${bill.totalAmount.toFixed(2)}`;
    displayDueDate.textContent = bill.dueDate;
    displayCustomer.textContent = bill.customerName;
    displayMeter.textContent = bill.meterNumber;
    displayCategory.textContent = bill.connectionType;
    displayDate.textContent = bill.billDate;

    // Breakdown table
    breakdownTableBody.innerHTML = bill.breakdown
      .filter(row => row.units > 0 || bill.unitsConsumed === 0 && row.slab.includes('0 - 100'))
      .map(row => `
        <tr>
          <td>${row.slab}</td>
          <td class="text-right font-mono">${row.units} kWh</td>
          <td class="text-right font-mono">₹${row.rate.toFixed(2)}</td>
          <td class="text-right font-mono">₹${row.amount.toFixed(2)}</td>
        </tr>
      `).join('');

    displayEnergyCharges.textContent = `₹${bill.energyCharges.toFixed(2)}`;
    displayFixedCharge.textContent = `₹${bill.fixedCharge.toFixed(2)}`;
    displayTaxRate.textContent = bill.taxRate;
    displayTaxAmount.textContent = `₹${bill.taxAmount.toFixed(2)}`;
  }

  function fallbackLocalCalculate(units, type, name, meter) {
    const isComm = type === 'commercial';
    const fixedCharge = isComm ? 120.0 : 50.0;
    const taxRate = isComm ? 0.09 : 0.05;

    let remaining = units;
    let energyCharges = 0;
    const rates = isComm ? [3.0, 4.5, 6.5, 8.5] : [1.5, 2.5, 4.0, 6.0];
    const slabs = ['0 – 100 units', '101 – 200 units', '201 – 300 units', 'Above 300 units'];
    const breakdown = [];

    for (let i = 0; i < 4; i++) {
      const cap = i === 3 ? Infinity : 100;
      const slabUnits = Math.min(remaining, cap);
      const amount = slabUnits > 0 ? slabUnits * rates[i] : 0;
      breakdown.push({ slab: slabs[i], units: slabUnits, rate: rates[i], amount });
      energyCharges += amount;
      remaining -= slabUnits;
      if (remaining <= 0) break;
    }

    const taxAmount = energyCharges * taxRate;
    const totalAmount = energyCharges + fixedCharge + taxAmount;
    const today = new Date().toISOString().split('T')[0];

    renderInvoice({
      customerName: name,
      meterNumber: meter,
      connectionType: type.charAt(0).toUpperCase() + type.slice(1),
      unitsConsumed: units,
      breakdown,
      energyCharges,
      fixedCharge,
      taxRate: (taxRate * 100) + '%',
      taxAmount,
      totalAmount,
      billDate: today,
      dueDate: today
    });
  }

  // Initial calculation on load
  calculateBill();
});
