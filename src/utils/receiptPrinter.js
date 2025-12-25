export const printReceipt = (receiptInfo, printFrame) => {
  if (
    !receiptInfo.paymentMethodLabel ||
    receiptInfo.paymentMethodLabel === "Unknown"
  ) {
    console.warn("No payment method selected. Receipt cannot be printed.");
    return;
  }

  const now = new Date();
  const dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedDate = now.toLocaleDateString("id-ID", dateOptions);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  //HTML content
  let receiptHTML = `
    <html lang="id">
      <head>
        <title>Struk Pembelian</title>
        <style>
          body {
            width: 58mm;
            font-family: Arial, sans-serif;
            font-size: 11px;
            text-align: left;
            margin: 0;
            padding: 3px;
            background-color: white;
          }
          h2 {
            margin: 2px 0;
            text-align: center;
            font-size: 12px;
          }
          .alamat {
            font-size: 9px;
            margin-bottom: 2px;
            text-align: center;
          }
          hr {
            border: 1px dashed black;
            margin: 2px 0;
          }
          .info {
            font-size: 10px;
          }
          .items {
            text-align: left;
            margin-bottom: 5px;
          }
          .items table {
            width: 100%;
            border-collapse: collapse;
          }
          .items td {
            font-size: 10px;
            padding: 1px 0;
          }
          .note {
            font-size: 8px;
            color: gray;
          }
          .total {
            font-weight: bold;
            font-size: 12px;
          }
          .footer {
            font-size: 8px;
            margin-top: 5px;
            text-align: center;
          }
          @page {
          size: auto;
          margin: 0;
          }
        </style>
      </head>
      <body>
        <img src="images/Logo.png" alt="Logo" style="width: 40%; max-width: 50mm; height: auto; display: block; margin: 0 auto;" />
        <h2>Stay High Coffee</h2>
        <div class="alamat">Metland sektor 7 Blok GA3 No.16, Kec. Cileungsi, Kabupaten Bogor, Jawa Barat</div>
        <hr />
        <div class="info">Customer: ${receiptInfo.customer}</div>
        <div class="info">Cashier: ${receiptInfo.cashier}</div>
        <div class="info">Date: ${formattedDate}</div> <hr />
        <div class="items">
          <table>
            ${receiptInfo.items
              .map(
                (item) => `
              <tr>
                <td style="text-align: left;">${item.name}</td>
                <td>x${item.qty}</td>
               <td>${formatCurrency(item.price * item.qty)}</td>
              </tr>
              ${
                item.note
                  ? `<tr><td colspan="3" class="note">${item.note}</td></tr>`
                  : ""
              }
            `
              )
              .join("")}
          </table>
        </div>
        <hr />
        <div class="payment-info">
          <div>TOTAL: ${formatCurrency(receiptInfo.total)}</div>
          <div>Paid: ${formatCurrency(receiptInfo.paid)}</div>
          <div>Change: ${formatCurrency(receiptInfo.change)}</div>
          <div>Method: ${receiptInfo.paymentMethodLabel}</div>
        </div>
        <hr />
        <div class="footer">
          Terima kasih telah berbelanja!<br />
          Semoga harimu menyenangkan<br />
          Powered by: WeTechnov
        </div>
      </body>
    </html>
  `;

  const frameDoc =
    printFrame.contentWindow ||
    printFrame.contentDocument.document ||
    printFrame.contentDocument;
  frameDoc.document.open();
  frameDoc.document.write(receiptHTML);
  frameDoc.document.close();

  return new Promise((resolve) => {
    printFrame.onload = function () {
      printFrame.contentWindow.print();
      resolve(true);
    };
  });
};
