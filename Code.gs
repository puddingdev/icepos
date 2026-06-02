const SPREADSHEET_ID   = '1DejloYurLE5YX7QqIYx96nWVY5dZJHlbzTw155beaRM';
const SHEET_ORDERS     = 'orders';
const SHEET_PURCHASES  = 'purchases';
const SHEET_CONFIG     = 'config';
const SHEET_ONLINE     = 'online_orders';

function doPost(e) {
  try {
    const body    = JSON.parse(e.postData.contents);
    const action  = body.action;
    const payload = body.payload;

    if (action === 'log')                return jsonResponse(logEntry(payload));
    if (action === 'createOrder')        return jsonResponse(createOrder(payload));
    if (action === 'updateOrderStatus')  return jsonResponse(updateOrderStatus(payload));
    if (action === 'confirmPayment')     return jsonResponse(confirmPayment(payload));
    if (action === 'setDeliveryPhoto')   return jsonResponse(setDeliveryPhoto(payload));

    return jsonResponse({ success: false, error: 'unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getAll')        return jsonResponse(getAllData());
    if (action === 'getOrders')     return jsonResponse(getOrders());
    if (action === 'getOrderByNo')  return jsonResponse(getOrderByNo(e.parameter.order_no));

    return jsonResponse({ error: 'unknown action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function createOrder(p) {
  const ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh   = ss.getSheetByName(SHEET_ONLINE);
  const rows = sh.getLastRow();

  const order_no = 'SL' + String(rows).padStart(6, '0');
  const ts = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');

  sh.appendRow([
    order_no,
    p.customer_name || '',
    p.phone         || '',
    p.address       || '',
    p.note          || '',
    p.source        || 'WEBSITE',
    JSON.stringify(p.items    || []),
    JSON.stringify(p.toppings || []),
    p.subtotal      || 0,
    p.delivery_fee  || 0,
    p.total         || 0,
    'UNPAID',
    'WAITING_FOR_STORE',
    '',
    ts
  ]);

  return { success: true, order_no: order_no };
}

function updateOrderStatus(p) {
  var row = findOrderRow(p.order_no);
  if (!row) return { success: false, error: 'order not found' };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName(SHEET_ONLINE);
  sh.getRange(row, 13).setValue(p.order_status);
  return { success: true };
}

function confirmPayment(p) {
  var row = findOrderRow(p.order_no);
  if (!row) return { success: false, error: 'order not found' };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName(SHEET_ONLINE);
  sh.getRange(row, 12).setValue('PAID');
  sh.getRange(row, 13).setValue('MAKING');
  return { success: true };
}

function setDeliveryPhoto(p) {
  var row = findOrderRow(p.order_no);
  if (!row) return { success: false, error: 'order not found' };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName(SHEET_ONLINE);
  sh.getRange(row, 14).setValue(p.photo_url || '');
  sh.getRange(row, 13).setValue('DELIVERED');
  return { success: true };
}

function getOrders() {
  var ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh   = ss.getSheetByName(SHEET_ONLINE);
  var data = sh.getDataRange().getValues();
  if (data.length <= 1) return { orders: [] };

  var orders = data.slice(1).map(function(r) {
    return {
      order_no:           r[0],
      customer_name:      r[1],
      phone:              r[2],
      address:            r[3],
      note:               r[4],
      source:             r[5],
      items:              safeJson(r[6], []),
      toppings:           safeJson(r[7], []),
      subtotal:           r[8],
      delivery_fee:       r[9],
      total:              r[10],
      payment_status:     r[11],
      order_status:       r[12],
      delivery_photo_url: r[13],
      created_at:         r[14]
    };
  });

  return { orders: orders };
}

function getOrderByNo(order_no) {
  if (!order_no) return { order: null };
  var row = findOrderRow(order_no);
  if (!row) return { order: null };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName(SHEET_ONLINE);
  var r  = sh.getRange(row, 1, 1, 15).getValues()[0];

  return {
    order: {
      order_no:           r[0],
      customer_name:      r[1],
      phone:              r[2],
      address:            r[3],
      note:               r[4],
      source:             r[5],
      items:              safeJson(r[6], []),
      toppings:           safeJson(r[7], []),
      subtotal:           r[8],
      delivery_fee:       r[9],
      total:              r[10],
      payment_status:     r[11],
      order_status:       r[12],
      delivery_photo_url: r[13],
      created_at:         r[14]
    }
  };
}

function logEntry(payload) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var d  = new Date(payload.date || new Date());
  var ts = Utilities.formatDate(d, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');

  if (payload.type === 'sale') {
    var sh = ss.getSheetByName(SHEET_ORDERS);
    sh.appendRow([
      ts, 'sale', payload.size,
      payload.flavors.join(', '),
      (payload.toppings || []).join(', '),
      payload.price, payload.cost, payload.profit
    ]);

  } else if (payload.type === 'eat') {
    var sh2 = ss.getSheetByName(SHEET_ORDERS);
    var iceParts = Object.keys(payload.ice || {}).map(function(k) { return k + ' ' + payload.ice[k] + 'scoop'; }).join(', ');
    var topParts = Object.keys(payload.top || {}).map(function(k) { return k + ' ' + payload.top[k]; }).join(', ');
    sh2.appendRow([ts, 'eat', '', iceParts, topParts, '', '', '']);

  } else if (payload.type === 'purchase') {
    var sh3 = ss.getSheetByName(SHEET_PURCHASES);
    sh3.appendRow([
      ts, payload.category, payload.name,
      payload.qty, payload.unit, payload.price, payload.costPerUnit
    ]);

  } else if (payload.type === 'config') {
    var sh4   = ss.getSheetByName(SHEET_CONFIG);
    var data = sh4.getDataRange().getValues();
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] === payload.key) {
        sh4.getRange(i+1, 2).setValue(payload.value);
        sh4.getRange(i+1, 3).setValue(new Date());
        return { success: true };
      }
    }
    sh4.appendRow([payload.key, payload.value, new Date()]);
  }

  return { success: true };
}

function getAllData() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  var oSh   = ss.getSheetByName(SHEET_ORDERS);
  var oRows = oSh.getDataRange().getValues().slice(1);
  var orders = oRows.map(function(r) {
    return { date: r[0], type: r[1], size: r[2], flavors: r[3], toppings: r[4], price: r[5], cost: r[6], profit: r[7] };
  });

  var pSh   = ss.getSheetByName(SHEET_PURCHASES);
  var pRows = pSh.getDataRange().getValues().slice(1);
  var purchases = pRows.map(function(r) {
    return { date: r[0], category: r[1], name: r[2], qty: r[3], unit: r[4], price: r[5], costPerUnit: r[6] };
  });

  var cSh   = ss.getSheetByName(SHEET_CONFIG);
  var cRows = cSh.getDataRange().getValues();
  var config = {};
  cRows.forEach(function(r) {
    try { config[r[0]] = JSON.parse(r[1]); }
    catch (e) { config[r[0]] = r[1]; }
  });

  return { orders: orders, purchases: purchases, config: config };
}

function findOrderRow(order_no) {
  var ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh   = ss.getSheetByName(SHEET_ONLINE);
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === order_no) return i + 1;
  }
  return null;
}

function safeJson(str, fallback) {
  try { return JSON.parse(str); }
  catch (e) { return fallback; }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  var o = ss.getSheetByName(SHEET_ORDERS);
  if (!o) o = ss.insertSheet(SHEET_ORDERS);
  o.getRange(1,1,1,8).setValues([['timestamp','type','size','flavors','toppings','price','cost','profit']]);

  var p = ss.getSheetByName(SHEET_PURCHASES);
  if (!p) p = ss.insertSheet(SHEET_PURCHASES);
  p.getRange(1,1,1,7).setValues([['timestamp','category','name','qty','unit','price','costPerUnit']]);

  var c = ss.getSheetByName(SHEET_CONFIG);
  if (!c) c = ss.insertSheet(SHEET_CONFIG);
  c.getRange(1,1,1,3).setValues([['key','value','lastUpdated']]);

  var n = ss.getSheetByName(SHEET_ONLINE);
  if (!n) n = ss.insertSheet(SHEET_ONLINE);
  n.getRange(1,1,1,15).setValues([[
    'order_no','customer_name','phone','address','note','source',
    'items','toppings','subtotal','delivery_fee','total',
    'payment_status','order_status','delivery_photo_url','created_at'
  ]]);

  SpreadsheetApp.flush();
  Logger.log('Setup complete!');
}
