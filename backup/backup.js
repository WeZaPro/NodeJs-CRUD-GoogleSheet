const express = require("express");
const req = require("express/lib/request");
const { google } = require("googleapis");

const app = express();
app.use(express.json());

async function getAuthSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({
    version: "v4",
    auth: client,
  });

  const spreadsheetId = "1lIIQvSlAom2te5TjG5Xl-aJAlIDPvR8elvIX_1fflkg";

  return {
    auth,
    client,
    googleSheets,
    spreadsheetId,
  };
}

app.get("/metadata", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const metadata = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  res.send(metadata.data);
});

app.get("/getRows", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "sheet1",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  res.send(getRows.data);
});

app.post("/addRow", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const { values } = req.body;

  const row = await googleSheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: "sheet1",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: values,
    },
  });

  res.send(row.data);
});

app.post("/updateValue", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const find = req.body.find;
  const update = req.body.update;

  //***** */

  const sheetName = "sheet1!A2:D5"; // Please set your sheet name.
  const inputValues = [find, update]; // This is a sample input value.

  const {
    data: { values },
  } = await googleSheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  });

  const updateValue = await googleSheets.spreadsheets.values.update({
    // spreadsheetId,
    // range: "sheet1!A2:D2",
    // valueInputOption: "USER_ENTERED",
    // resource: {
    //   values: values,
    // },

    spreadsheetId,
    range: sheetName,
    resource: {
      values: values.map(
        (r) => (inputValues.includes(r[0]) ? [r[0], inputValues[1]] : r) // r[0] ตัวที่ 2 คือ value column ที่ี 2 ใน googlesheet / inputValues[1] คือค่าที่เอาไป update
      ),
    },
    valueInputOption: "USER_ENTERED",
  });

  res.send(updateValue.data);
});

app.post("/findValue", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  let array = [];
  googleSheets.spreadsheets.values.get(
    {
      spreadsheetId: spreadsheetId,
      range: "sheet1!A2:D5",
    },
    (err, res) => {
      //if (err) return console.log("The API returned an error: " + err);
      const rows = res.data.values;

      console.log("rows data found.", rows);
      if (rows.length) {
        rows.map((row) => {
          for (let i = 0; i < row.length; i++) {
            if (row[0] === "wee2") {
              array.push(row[i]);
            }
          }

          // }
        });
        console.log("data found.==> ", array);
      } else {
        console.log("No data found.");
      }
    }
  );

  res.send("find data");
});

app.listen(3001, () => console.log("Rodando na porta 3001"));
