import { formatCurrency } from "./formatter/currency";

/**
 * Mencetak laporan gabungan dari order history sesuai filter yang dipilih.
 * @param {Array} ordersToPrint - Array objek order yang akan dicetak sebagai laporan gabungan.
 * @param {Object} printFrameRef - Referensi Vue ke elemen iframe.
 * @param {Array} unpaidOrders - Array objek cart yang belum dibayar. (Parameter baru)
 * @returns {Promise<boolean>} Promise yang resolve true jika pencetakan berhasil diinisiasi, false jika tidak ada data, atau reject jika ada error.
 */
export async function printReceiptHtml(
  ordersToPrint,
  printFrameRef,
  unpaidOrders = []
) {
  return new Promise((resolve, reject) => {
    if (!printFrameRef || !printFrameRef.value) {
      console.error("Error: printFrameRef tidak valid.");
      return reject("Print frame reference is not valid.");
    }

    // Periksa apakah ada data untuk dicetak sama sekali
    if (ordersToPrint.length === 0 && unpaidOrders.length === 0) {
      console.warn(
        "Tidak ada data transaksi (baik yang sudah dibayar maupun belum) untuk dicetak."
      );
      return resolve(false); // Resolve false karena tidak ada yang perlu dicetak
    }

    // --- START: Bagian untuk pesanan yang belum dibayar ---
    let unpaidOrdersHtml = "";
    let totalUnpaidAmountOverall = 0;

    if (unpaidOrders && unpaidOrders.length > 0) {
      unpaidOrdersHtml += `
        <div class="unpaid-orders-section">
          <p style="font-weight: bold; margin-bottom: 5px; text-align: center;">--- Pesanan Belum Dibayar ---</p>
      `;

      // Kelompokkan cart items berdasarkan customer dan kemudian tampilkan
      const groupedUnpaidOrders = unpaidOrders.reduce((acc, item) => {
        const customerName = item.customer?.customer || "Umum";
        if (!acc[customerName]) {
          acc[customerName] = {
            customer_name: customerName,
            timestamp: item.timestamp,
            details: [],
            total_unpaid_for_customer: 0,
          };
        }

        const menuName = item.menu_detail?.menu_id?.name || "N/A";

        const qty = Number(item.quantity) || 0;
        const price = Number(item.menu_detail?.price) || 0;
        const totalItemPrice = qty * price;

        acc[customerName].details.push({
          menu_name: menuName,
          quantity: qty,
          total_price: totalItemPrice,
          note: item.note,
        });
        acc[customerName].total_unpaid_for_customer += totalItemPrice;
        totalUnpaidAmountOverall += totalItemPrice;

        return acc;
      }, {});

      // Buat HTML untuk setiap grup customer
      for (const customerGroup of Object.values(groupedUnpaidOrders)) {
        unpaidOrdersHtml += `
            <div class="unpaid-customer-group">
                <p>Tanggal: ${formatDate(customerGroup.timestamp)}</p>
                <p>Customer: ${customerGroup.customer_name}</p>
                <table>
                    <thead>
                        <tr>
                            <th style="text-align: left;">Menu</th>
                            <th style="text-align: right;">Qty</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        customerGroup.details.forEach((detail) => {
          unpaidOrdersHtml += `
                        <tr>
                            <td style="text-align: left;">${
                              detail.menu_name
                            }</td>
                            <td>${detail.quantity}</td>
                            <td>${formatCurrency(detail.total_price).replace(
                              "Rp",
                              ""
                            )}</td>
                        </tr>
                        ${
                          detail.note
                            ? `<tr><td colspan="3" class="note-unpaid">Catatan: ${detail.note}</td></tr>`
                            : ""
                        }
          `;
        });
        unpaidOrdersHtml += `
                    </tbody>
                </table>
                <p style="text-align: right; font-weight: bold;">Subtotal Belum Dibayar: ${formatCurrency(
                  customerGroup.total_unpaid_for_customer
                )}</p>
                <hr style="border-top: 0.5px dashed #aaa; margin: 5px 0;" />
            </div>
        `;
      }

      unpaidOrdersHtml += `
          <p style="text-align: right; font-weight: bold; margin-top: 10px;">TOTAL SEMUA BELUM DIBAYAR: ${formatCurrency(
            totalUnpaidAmountOverall
          )}</p>
          <hr />
        </div>
      `;
    }
    // --- END: Bagian untuk pesanan yang belum dibayar ---

    // Hitung total keseluruhan untuk laporan transaksi yang sudah dibayar
    let grandTotalSales = 0;
    const grandTotalSoldByCategory = {};
    const grandTotalSoldByMenu = {};
    const grandTotalPaidByPaymentMethod = {};
    const grandCountByPaymentMethod = {};

    let allOrdersSectionHtml = "";

    // Hanya proses ordersToPrint jika ada
    if (ordersToPrint && ordersToPrint.length > 0) {
      ordersToPrint.forEach((orderData) => {
        // Tambahkan detail order ke HTML
        allOrdersSectionHtml += generateOrderSectionHtml(orderData); // Panggil fungsi untuk setiap bagian order

        // Perbarui grand total
        orderData.details.forEach((detail) => {
          // PROTEKSI NaN
          const detailTotalPrice = Number(detail.total_price) || 0;
          const detailQty = Number(detail.quantity) || 0;

          grandTotalSales += detailTotalPrice;
          const categoryName = detail.category || "Tanpa Kategori";
          grandTotalSoldByCategory[categoryName] =
            (grandTotalSoldByCategory[categoryName] || 0) + detailQty;
          const menuName = detail.menu_name || "N/A";
          grandTotalSoldByMenu[menuName] =
            (grandTotalSoldByMenu[menuName] || 0) + detailQty;
        });

        // Perbarui total pembayaran per metode
        const paymentMethod = orderData.payment_method || "Tunai"; // Default ke "Tunai" jika tidak ada
        const paidValue = Number(orderData.paid) || 0;

        grandTotalPaidByPaymentMethod[paymentMethod] =
          (grandTotalPaidByPaymentMethod[paymentMethod] || 0) + paidValue;

        // Perbarui juga jumlah pembelian per metode
        grandCountByPaymentMethod[paymentMethod] =
          (grandCountByPaymentMethod[paymentMethod] || 0) + 1;
      });
    } else {
      allOrdersSectionHtml =
        "<p style='text-align: center; margin-top: 20px;'>Tidak ada riwayat pesanan yang sudah dibayar dalam filter ini.</p>";
    }

    // Buat HTML untuk ringkasan kategori keseluruhan
    let grandCategorySummaryHtml = "";
    if (Object.keys(grandTotalSoldByCategory).length > 0) {
      grandCategorySummaryHtml += '<div class="summary-section">';
      grandCategorySummaryHtml +=
        '<p style="font-weight: bold; margin-bottom: 5px;">Ringkasan Penjualan per Kategori:</p>';
      for (const [category, quantity] of Object.entries(
        grandTotalSoldByCategory
      )) {
        grandCategorySummaryHtml += `<p class="summary-item">- ${category}: ${quantity} item</p>`;
      }
      grandCategorySummaryHtml += "</div>";
    }

    // Buat HTML untuk ringkasan menu keseluruhan
    let grandMenuSummaryHtml = "";
    if (Object.keys(grandTotalSoldByMenu).length > 0) {
      grandMenuSummaryHtml += '<div class="summary-section">';
      grandMenuSummaryHtml +=
        '<p style="font-weight: bold; margin-bottom: 5px;">Ringkasan Penjualan per Menu:</p>';
      for (const [menu, quantity] of Object.entries(grandTotalSoldByMenu)) {
        grandMenuSummaryHtml += `<p class="summary-item">- ${menu}: ${quantity} item</p>`;
      }
      grandMenuSummaryHtml += "</div>";
    }

    // Ringkasan pembayaran per metode (jumlah uang)
    let grandPaymentAmountSummaryHtml = "";
    if (Object.keys(grandTotalPaidByPaymentMethod).length > 0) {
      grandPaymentAmountSummaryHtml += '<div class="summary-section">';
      grandPaymentAmountSummaryHtml +=
        '<p style="font-weight: bold; margin-bottom: 5px;">Total Pembayaran per Metode:</p>';
      for (const [method, amount] of Object.entries(
        grandTotalPaidByPaymentMethod
      )) {
        grandPaymentAmountSummaryHtml += `<p class="summary-item">- ${method}: ${formatCurrency(
          amount
        )}</p>`;
      }
      grandPaymentAmountSummaryHtml += "</div>";
    }

    // Ringkasan jumlah pembelian per metode
    let grandPaymentCountSummaryHtml = "";
    if (Object.keys(grandCountByPaymentMethod).length > 0) {
      grandPaymentCountSummaryHtml += '<div class="summary-section">';
      grandPaymentCountSummaryHtml +=
        '<p style="font-weight: bold; margin-bottom: 5px;">Jumlah Pembelian per Metode:</p>';
      for (const [method, count] of Object.entries(grandCountByPaymentMethod)) {
        grandPaymentCountSummaryHtml += `<p class="summary-item">- ${method}: ${count} pembelian</p>`;
      }
      grandPaymentCountSummaryHtml += "</div>";
    }

    const fullHtmlContent = `
      <html lang="id">
        <head>
          <title>Laporan Riwayat Pembelian</title>
          <style>
            body {
              width: 58mm; /* Lebar kertas thermal */
              font-family: 'Consolas', 'Monospace', sans-serif;
              font-size: 9pt;
              line-height: 1.3;
              margin: 0 auto;
              padding: 5px;
              background-color: white;
              color: black;
            }
            .header, .footer { text-align: center; margin-bottom: 10px; }
            h3 { margin: 0; font-size: 11pt; }
            p { margin: 0; font-size: 8pt; }
            .alamat { font-size: 7pt; }
            hr { border: 0.5px dashed black; margin: 5px 0; }
            .order-section { margin-bottom: 10px; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
            .order-section:last-child { border-bottom: none; } /* No border for the last order */
            table { width: 100%; border-collapse: collapse; margin-top: 5px;}
            th, td { font-size: 8pt; padding: 2px 0; }
            th { text-align: left; }
            td { text-align: right; }
            .total-row td { font-weight: bold; font-size: 9pt; }
            .summary-section { margin-top: 10px; padding-top: 5px; border-top: 1px dashed black;}
            .summary-item { text-align: left; margin: 0; font-size: 8pt; }
            .note-unpaid { font-size: 7pt; color: #555; text-align: left; padding-left: 10px;}

            /* Style untuk total keseluruhan laporan */
            .grand-total-section {
                margin-top: 15px;
                padding-top: 10px;
                border-top: 2px solid black;
                text-align: right;
            }
            .grand-total-section p {
                font-size: 10pt;
                font-weight: bold;
            }
            .unpaid-orders-section {
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px dashed black;
            }
            .unpaid-customer-group {
                margin-bottom: 10px;
            }
            .unpaid-orders-section table th, .unpaid-orders-section table td {
                font-size: 8pt;
                padding: 2px 0;
            }
            @page {
              size: auto;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>Stay High Coffee</h3>
            <p class="alamat">Metland Sektor 7, Blok GA3 No.16</p>
            <p class="alamat">Kec. Cileungsi, Kabupaten Bogor, Jawa Barat 16820</p>
            <hr />
            <p style="font-size: 9pt; font-weight: bold; margin-bottom: 5px;">LAPORAN TRANSAKSI</p>
            <p style="font-size: 8pt;">Periode: ${
              ordersToPrint.length > 0
                ? formatDateRange(ordersToPrint)
                : "Tidak ada data"
            }</p>
          </div>

          ${unpaidOrdersHtml}
          ${allOrdersSectionHtml}

          <div class="grand-total-section">
            <p>TOTAL PENDAPATAN: ${formatCurrency(grandTotalSales)}</p>
          </div>

          ${grandCategorySummaryHtml}
          ${grandMenuSummaryHtml}
          ${grandPaymentAmountSummaryHtml}
          ${grandPaymentCountSummaryHtml}
          <div class="footer">
            <hr />
            <p style="font-size: 8pt;">Laporan dicetak pada: ${formatDate(
              new Date()
            )}</p>
            <p style="font-size: 7pt;">Terima kasih atas kerja keras Anda!</p>
          </div>
        </body>
      </html>
    `;

    const frameDoc =
      printFrameRef.value.contentWindow ||
      printFrameRef.value.contentDocument.document ||
      printFrameRef.value.contentDocument;

    frameDoc.document.open();
    frameDoc.document.write(fullHtmlContent);
    frameDoc.document.close();

    printFrameRef.value.onload = function () {
      try {
        printFrameRef.value.contentWindow.print();
        resolve(true);
      } catch (error) {
        console.error("Error during iframe print:", error);
        reject(error);
      }
    };
  });
}

/**
 * Menghasilkan HTML untuk satu bagian order dalam laporan gabungan.
 * @param {Object} orderData - Objek data order tunggal.
 * @returns {string} HTML string untuk bagian order.
 */
function generateOrderSectionHtml(orderData) {
  if (!orderData || !orderData.details || orderData.details.length === 0) {
    return "<p>Tidak ada data untuk order ini.</p>";
  }

  let itemsHtml = "";
  orderData.details.forEach((item) => {
    // PROTEKSI NaN
    const qty = Number(item.quantity) || 0;
    const price = Number(item.menu_price) || 0;
    const total = Number(item.total_price) || 0;

    itemsHtml += `
      <tr>
        <td style="text-align: left;">${item.menu_name}</td>
        <td>${qty}</td>
        <td>${formatCurrency(price).replace("Rp", "")}</td>
        <td>${formatCurrency(total).replace("Rp", "")}</td>
      </tr>
    `;
  });

  const totalAmount = orderData.details.reduce(
    (sum, detail) => sum + (Number(detail.total_price) || 0),
    0
  );
  const paidAmount = Number(orderData.paid) || 0;
  const changeAmount = paidAmount - totalAmount;

  return `
    <div class="order-section">
      <p>ID Transaksi: ${orderData.id}</p>
      <p>Tanggal & Waktu: ${formatDate(orderData.created_at)}</p>
      <p>Pelanggan: ${orderData.customer_name || "Umum"}</p>
      <p>Metode Pembayaran: ${orderData.payment_method || "-"}</p>
      <table>
        <thead>
          <tr>
            <th style="text-align: left;">Menu</th>
            <th style="text-align: right;">Qty</th>
            <th style="text-align: right;">Harga</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p style="text-align: right;"><b>Subtotal: ${formatCurrency(
        totalAmount
      )}</b></p>
      <p style="text-align: right;">Dibayar: ${formatCurrency(paidAmount)}</p>
      <p style="text-align: right;">Kembalian: ${formatCurrency(
        changeAmount
      )}</p>
    </div>
  `;
}

// Helper function untuk format tanggal lengkap (internal untuk file ini)
function formatDate(dateString) {
  if (!dateString) return "Invalid Date";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

// Helper function untuk format rentang tanggal (internal untuk file ini)
function formatDateRange(orders) {
  if (!orders || orders.length === 0) {
    return "";
  }

  const sortedOrders = [...orders].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const firstDate = new Date(sortedOrders[0].created_at);
  const lastDate = new Date(sortedOrders[sortedOrders.length - 1].created_at);

  const formatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Jakarta",
  };

  const formattedFirstDate = new Intl.DateTimeFormat(
    "id-ID",
    formatOptions
  ).format(firstDate);
  const formattedLastDate = new Intl.DateTimeFormat(
    "id-ID",
    formatOptions
  ).format(lastDate);

  if (formattedFirstDate === formattedLastDate) {
    return formattedFirstDate;
  } else {
    return `${formattedFirstDate} - ${formattedLastDate}`;
  }
}
