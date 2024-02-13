// *******ใช้ API Google => CRUD => Google Sheet => Test จาก PostMan
const express = require("express");
const req = require("express/lib/request");
const { google } = require("googleapis");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    return res.status(200).json({});
  }
  next();
});

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

// app.get("/metadata", async (req, res) => {
//   const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

//   const metadata = await googleSheets.spreadsheets.get({
//     auth,
//     spreadsheetId,
//   });

//   res.send(metadata.data);
// });

app.post("/user", async (req, res) => {
  // const { values } = req.body;
  const values = req.body;

  //Todo เพิ่ม Find userId ใน google sheet ก่อน ถ้ามี = ซ้ำ ถ้าไม่มี = save

  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  // save data
  const row = await googleSheets.spreadsheets.values
    .append({
      auth,
      spreadsheetId,
      range: "sheet1",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
          [
            values.UserID,
            values.Destination,
            values.NAME,
            values.PHONE,
            values.URL,
          ],
        ],
      },
    })
    .then((saveDB) => {
      console.log("saveDB ===> ", saveDB.config.data.values);

      res.send({
        status: "OK",
        data: {
          UserID: saveDB.config.data.values[0][0],
          Destination: saveDB.config.data.values[0][1],
          NAME: saveDB.config.data.values[0][2],
          PHONE: saveDB.config.data.values[0][3],
          URL: saveDB.config.data.values[0][4],
        },
      });
    });

  // res.send({ status: "OK", data: "TEST" });
});

app.get("/users/:id", async (req, res) => {
  // console.log("req.params.id--> ", req.params.id);
  const queryUserIdInput = req.params.id;
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    //range: "sheet1",
    range: "sheet1!A2:E",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const getHeader = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    //range: "sheet1",
    range: "sheet1!A1:E1",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  //=======
  let headArr = getHeader.data.values;
  let headKey = [];
  headArr.forEach((e, i) => {
    headKey = e;
  });
  let bodyArr = getRows.data.values;

  if (bodyArr) {
    //console.log("bodyArr--> ", bodyArr);
    let bodyValues = [];
    bodyArr.forEach((e, i) => {
      bodyValues.push(e);
    });

    const obj = {};
    const objArr = [];
    const keys = headKey;
    const values = bodyValues;
    const _qryUserId = [];
    let _status = "";

    values.forEach((e, i) => {
      for (var i = 0; i < keys.length; i++) {
        obj[keys[i]] = e[i];
      }
      objArr.push({
        UserID: obj.UserID,
        Destination: obj.Destination,
        NAME: obj.NAME,
        PHONE: obj.PHONE,
        URL: obj.URL,
      });
    });

    objArr.forEach((e, i) => {
      if (e.UserID === queryUserIdInput) {
        _qryUserId.push({
          UserID: e.UserID,
          Destination: e.Destination,
          NAME: e.NAME,
          PHONE: e.PHONE,
          URL: e.URL,
        });
      }
    });
    if (_qryUserId.length === 0) {
      res.send({ status: "NoData" });
    } else {
      res.send({ status: "OK", data: _qryUserId });
    }
  } else {
    console.log("No Data--> ");
    res.send({ status: "NoData" });
  }
  //res.json(users.find(user => user.id === Number(req.params.id)))
});

app.get("/allUser", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    //range: "sheet1",
    range: "sheet1!A2:E",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const getHeader = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    //range: "sheet1",
    range: "sheet1!A1:E1",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  //=======
  let headArr = getHeader.data.values;
  let headKey = [];
  headArr.forEach((e, i) => {
    headKey = e;
  });
  let bodyArr = getRows.data.values;

  if (bodyArr) {
    console.log("bodyArr--> ", bodyArr);
    let bodyValues = [];
    bodyArr.forEach((e, i) => {
      bodyValues.push(e);
    });

    const obj = {};
    const objArr = [];
    const keys = headKey;
    const values = bodyValues;

    values.forEach((e, i) => {
      for (var i = 0; i < keys.length; i++) {
        obj[keys[i]] = e[i];
      }
      console.log("e>>>>-> ", e);
      objArr.push({
        UserID: obj.UserID,
        Destination: obj.Destination,
        NAME: obj.NAME,
        PHONE: obj.PHONE,
        URL: obj.URL,
      });
    });

    console.log("objArr>>>>-> ", objArr);
    //res.send(objArr);
    res.send({ status: "OK", data: objArr });
  } else {
    console.log("No Data--> ");
    res.send({ status: "NoData" });
  }
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
  const findData = req.body.find;
  let array = [];
  googleSheets.spreadsheets.values.get(
    {
      spreadsheetId: spreadsheetId,
      range: "sheet1!A2:D5",
    },
    (err, _res) => {
      //if (err) return console.log("The API returned an error: " + err);
      const rows = _res.data.values;

      if (rows.length) {
        console.log("rows.length==> ", rows.length);
        rows.map((row) => {
          for (let i = 0; i < row.length; i++) {
            if (row[0] === findData) {
              array.push(row[i]);
            }
          }

          // }
        });
        //console.log("data found.==> ", array);
        if (array.length) {
          console.log("data found.==> ", array);
          res.send({ find: array[0], foundData: array[1] });
        } else {
          console.log("data not found.==> ");
          res.send("No data found.");
        }
        // res.send({ find: array[0], foundData: array[1] });
      } else {
        res.send("No data found.");
      }
    }
  );

  // res.send("find data");
});

app.listen(3001, () => console.log("weesak porta 3001"));
