import { format } from "date-fns/format";

export const getOrderB2BTemplate = (
  logo: string,
  customerName: string,
  Insurance: string,
  insurance: string,
  doc: string,
  orderId: string,
  createdDate: string,
  buisness: string,
  url: string,
  jubilee: string,
  takaful: boolean,
  productName: string,
  productPremium: string
) => {
  const premiumHeader = takaful
    ? `<th align="right" bgcolor="#EAEAEA" style="font-size: 13px; padding: 3px 9px" width="20%">Contribution</th>`
    : `<th align="right" bgcolor="#EAEAEA" style="font-size: 13px; padding: 3px 9px" width="20%">Premium</th>`;

  const parentsCarePromo = productName
    ?.toLowerCase()
    .includes("parents-care-plus")
    ? `
      <table
        cellspacing="0"
        cellpadding="0"
        border="0"
        width="650"
        style="border: 1px solid #eaeaea; font-size: 12px"
      >
        <thead>
          <tr>
            <th
              align="left"
              bgcolor="#EAEAEA"
              style="font-size: 13px; padding: 3px 9px"
            >
              <b>Now that you've secured your loved ones, it's time to protect your vehicle!</b>
              Use code <b>PARENTSCAREPLUS20</b> for <b>20% off</b> on your motor insurance via My Jubilee App.
            </th>
          </tr>
        </thead>
      </table>
      <br/>
    `
    : "";

  return `<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=windows-1252" />
  </head>
  <body
    style="
      background: #f6f6f6;
      font-family: Verdana, Arial, Helvetica, sans-serif;
      font-size: 12px;
      margin: 0;
      padding: 0;
    "
  >
    <div
      style="
        background: #f6f6f6;
        font-family: Verdana, Arial, Helvetica, sans-serif;
        font-size: 12px;
        margin: 0;
        padding: 0;
      "
    >
      <table cellspacing="0" cellpadding="0" border="0" width="100%">
        <tbody>
          <tr>
            <td align="center" valign="top" style="padding: 20px 0 20px 0">
              <table
                bgcolor="#FFFFFF"
                cellspacing="0"
                cellpadding="10"
                border="0"
                width="650"
                style="border: 1px solid #e0e0e0"
              >
                <!-- [ header starts here] -->
                <tbody>
                  <tr>
                    <td valign="top">
                      <img
                        src="${logo}"
                        style="margin-bottom: 10px"
                        border="0"
                        height="100"
                        width="100"
                      />
                    </td>
                  </tr>
                  <!-- [ middle starts here] -->
                  <tr>
                    <td valign="top">
                      <h1
                        style="
                          font-size: 22px;
                          font-weight: normal;
                          line-height: 22px;
                          margin: 0 0 11px 0;
                        "
                      >
                        Dear ${customerName},
                      </h1>
                      <p style="font-size: 12px; line-height: 16px; margin: 0">
                        Thank you for choosing Jubilee General ${Insurance}. We
                        are pleased to confirm the completion of your transaction and commencement of
                        ${insurance} coverage as per given period. Your ${doc}
                        are attached for your record and information.
                      </p>
                      <br /><br />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <h2
                        style="font-size: 18px; font-weight: normal; margin: 0"
                      >
                        Your Order # ${orderId}
                        <small>(placed on ${format(
                          new Date(createdDate),
                          "MMM dd, yyyy HH:mm:ss"
                        )})</small>
                      </h2>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <br />
                      <br />
                      <table
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        width="650"
                        style="border: 1px solid #eaeaea; font-size: 12px"
                      >
                        <thead>
                          <tr>
                            <th
                              align="left"
                              bgcolor="#EAEAEA"
                              style="font-size: 13px; padding: 3px 9px"
                            >
                              Item
                            </th>
                            ${premiumHeader}
                          </tr>
                        </thead>

                        <tbody bgcolor="#F6F6F6">
                          <tr>
                            <td
                              align="left"
                              valign="top"
                              style="padding: 3px 9px"
                            >
                              <strong>${productName}</strong>
                            </td>
                            <td
                              align="right"
                              valign="top"
                              style="padding: 3px 9px"
                            >
                              <span>PKR ${productPremium}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <br />

                      ${parentsCarePromo}

                      <p style="font-size: 12px; margin: 0 0 10px 0">
                        <br />
                        For any Queries, Complaints, or Claims, please feel free
                        to contact us anytime at,<br />
                        ${buisness}<br />
                        Jubilee General Insurance Company Limited<br />
                        2nd Floor, Jubilee House, <br />
                        I.I. Chundrigar Road, Karachi 74000, Pakistan<br />
                        UAN: (021) 111-654-111 <br />
                        Direct Line: (021) <br />
                        Toll Free # 0800 03786 <br />
                        Email:
                      </p>
                      <p style="font-size: 12px; margin: 0 0 10px 0">
                        Please visit our website
                        <a href="${url}" target="_blank">${url}</a> for our
                        Company & Products information.<br />
                        For & on behalf of<br />
                        <br />
                        Protecting Your Lifestyle
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td
                      bgcolor="#EAEAEA"
                      align="center"
                      style="background: #eaeaea; text-align: center"
                    >
                      <center>
                        <p style="font-size: 12px; margin: 0">
                          Thank you, <strong>${jubilee}</strong>
                        </p>
                      </center>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>`;
};

export const getOrderCODTemplate = (
  logo: string,
  customerName: string,
  Insurance: string,
  insurance: string,
  doc: string,
  orderId: string,
  createdDate: string,
  buisness: string,
  url: string,
  jubilee: string,
  takaful: boolean,
  productName: string,
  productPremium: string,
  shippingName: string,
  shippingEmail: string,
  shippingAddress: string,
  shippingCharges: string,
  shippingContact: string,
  TrackingNumber: string
) => {
  const premiumHeader = takaful
    ? `<th align="right" bgcolor="#EAEAEA" style="font-size: 13px; padding: 3px 9px" width="20%">Contribution</th>`
    : `<th align="right" bgcolor="#EAEAEA" style="font-size: 13px; padding: 3px 9px" width="20%">Premium</th>`;

  const parentsCarePromo = productName
    ?.toLowerCase()
    .includes("parents-care-plus")
    ? `
      <table
        cellspacing="0"
        cellpadding="0"
        border="0"
        width="650"
        style="border: 1px solid #eaeaea; font-size: 12px"
      >
        <thead>
          <tr>
            <th
              align="left"
              bgcolor="#EAEAEA"
              style="font-size: 13px; padding: 3px 9px"
            >
              <b>Now that you've secured your loved ones, it's time to protect your vehicle!</b>
              Use code <b>PARENTSCAREPLUS20</b> for <b>20% off</b> on your motor insurance via My Jubilee App.
            </th>
          </tr>
        </thead>
      </table>
      <br/>
    `
    : "";

  return `<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=windows-1252" />
  </head>
  <body
    style="
      background: #f6f6f6;
      font-family: Verdana, Arial, Helvetica, sans-serif;
      font-size: 12px;
      margin: 0;
      padding: 0;
    "
  >
    <div
      style="
        background: #f6f6f6;
        font-family: Verdana, Arial, Helvetica, sans-serif;
        font-size: 12px;
        margin: 0;
        padding: 0;
      "
    >
      <table cellspacing="0" cellpadding="0" border="0" width="100%">
        <tbody>
          <tr>
            <td align="center" valign="top" style="padding: 20px 0 20px 0">
              <table
                bgcolor="#FFFFFF"
                cellspacing="0"
                cellpadding="10"
                border="0"
                width="650"
                style="border: 1px solid #e0e0e0"
              >
                <!-- [ header starts here] -->
                <tbody>
                  <tr>
                    <td valign="top">
                      <img
                        src="${logo}"
                        alt="Jubilee Logo" style="max-width:150px;margin-bottom: 10px"
                        border="0"
                      />
                    </td>
                  </tr>
                  <!-- [ middle starts here] -->
                  <tr>
                    <td valign="top">
                      <h1
                        style="
                          font-size: 22px;
                          font-weight: normal;
                          line-height: 22px;
                          margin: 0 0 11px 0;
                        "
                      >
                        Dear ${customerName},
                      </h1>
                      <p style="font-size: 12px; line-height: 16px; margin: 0">
                        Thank you for choosing Jubilee General ${Insurance}. We
                        are pleased to confirm the completion of your transaction and commencement of
                        ${insurance} coverage as per given period. Your ${doc}
                        are attached for your record and information. 
                        <br/>
                        To track your order, please <a href="https://www.blue-ex.com/tracking?trackno=${TrackingNumber}">click here</a>
                      </p>
                      <br /><br />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <h2
                        style="font-size: 18px; font-weight: normal; margin: 0"
                      >
                        Your Order # ${orderId}
                        <small>(placed on ${format(
                          new Date(createdDate),
                          "MMM dd, yyyy HH:mm:ss"
                        )})</small>
                      </h2>
                    </td>
                  </tr>
                  <tr>
                    <td>
                    <br/>
                    <br/>
                      <table
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        width="650"
                        style="border: 1px solid #eaeaea; font-size: 12px"
                      >
                        <thead>
                          <tr>
                            <th
                              align="left"
                              bgcolor="#EAEAEA"
                              style="font-size: 13px; padding: 3px 9px"
                            >
                              Item
                            </th>
                            ${premiumHeader}
                          </tr>
                        </thead>

                        <tbody bgcolor="#F6F6F6">
                          <tr>
                            <td
                              align="left"
                              valign="top"
                              style="padding: 3px 9px"
                            >
                              <strong>${productName}</strong>
                            </td>
                            <td
                              align="right"
                              valign="top"
                              style="padding: 3px 9px"
                            >
                              <span>PKR ${productPremium}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <br/>
                      <table
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        width="650"
                        style="border: 1px solid #eaeaea; font-size: 12px"
                      >
                         <thead>
                          <tr>
                            <th
                              align="left"
                              bgcolor="#EAEAEA"
                              style="font-size: 13px; padding: 3px 9px"
                              colSpan=2
                            >
                              Shipping Details
                            </th>
                          </tr>
                        </thead>
                        <tbody bgcolor="#F6F6F6">
                          <tr>
                            <th
                              align="left"
                              valign="top"
                              style="padding: 3px 9px"
                            >
                              Shipping Name
                            </th>
                            <td
                              align="right"
                              valign="top"
                              style="padding: 3px 9px"
                            >
                              <span>${shippingName}</span>
                            </td>
                          </tr>
                          <tr>
                            <th
                              align="left"
                              valign="top"
                              style="padding: 3px 9px"
                            >
                              Shipping Email
                            </th>
                            <td
                              align="right"
                              valign="top"
                              style="padding: 3px 9px"
                            >
                              <span>${shippingEmail}</span>
                            </td>
                          </tr>
                          <tr>
                            <th
                              align="left"
                              valign="top"
                              style="padding: 3px 9px"
                            >
                              Shipping Contact
                            </th>
                            <td
                              align="right"
                              valign="top"
                              style="padding: 3px 9px"
                            >
                              <span>${shippingContact}</span>
                            </td>
                          </tr>
                          <tr>
                            <th
                              align="left"
                              valign="top"
                              style="padding: 3px 9px"
                            >
                              Shipping Charges
                            </th>
                            <td
                              align="right"
                              valign="top"
                              style="padding: 3px 9px"
                            >
                              <span>${shippingCharges}</span>
                            </td>
                          </tr>
                          <tr>
                            <th
                              align="left"
                              valign="top"
                              style="padding: 3px 9px"
                            >
                              Shipping Address
                            </th>
                            <td
                              align="right"
                              valign="top"
                              style="padding: 3px 9px"
                            >
                              <span>${shippingAddress}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <br />

                      ${parentsCarePromo}

                      </br>
                      <p style="font-size: 12px; margin: 0 0 10px 0">
                        <br />
                        For any Queries, Complaints, or Claims, please feel free
                        to contact us anytime at,<br />
                        ${buisness}<br />
                        Jubilee General Insurance Company Limited<br />
                        2nd Floor, Jubilee House, <br />
                        I.I. Chundrigar Road, Karachi 74000, Pakistan<br />
                        UAN: (021) 111-654-111 <br />
                        Direct Line: (021) <br />
                        Toll Free # 0800 03786 <br />
                        Email:
                      </p>
                      <p style="font-size: 12px; margin: 0 0 10px 0">
                        Please visit our website
                        <a href="${url}" target="_blank">${url}</a> for our
                        Company & Products information.<br />
                        For & on behalf of<br />
                        <br />
                        Protecting Your Lifestyle
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td
                      bgcolor="#EAEAEA"
                      align="center"
                      style="background: #eaeaea; text-align: center"
                    >
                      <center>
                        <p style="font-size: 12px; margin: 0">
                          Thank you, <strong>${jubilee}</strong>
                        </p>
                      </center>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>`;
};
