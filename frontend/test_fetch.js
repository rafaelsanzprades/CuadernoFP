const fs = require('fs');

async function testFetch() {
  try {
    const response = await fetch("http://localhost:8000/api/pdf?type=matrices", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        module_data: {},
        curso_data: {},
        fecha_corte: null
      })
    });
    console.log("Status:", response.status);
    console.log("OK:", response.ok);
    console.log("Headers:", response.headers);
    if (!response.ok) {
      console.log("Text:", await response.text());
    } else {
      console.log("Success! Blob size:", (await response.blob()).size);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
testFetch();
