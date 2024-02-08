import puppeteer from "puppeteer";
import fs from "node:fs";

const nSeats = 266;
const candidates2024 = [];
const rootURL = `https://www.geo.tv/election/`;

(async () => {
  for (let i = 1; i <= nSeats; i++) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${rootURL}/NA-${i}`);

    const seatHeader = await page.$("div.top_box_left h2");
    const seat = await page.evaluate((el) => el.innerText, seatHeader);

    console.log(seat);

    const table = await page.$("div#task-table");
    const tableRows = await table.$$("div.table-row:not(.table_heading)");

    const result = [];
    console.log(tableRows.length);
    for (const row of tableRows) {
      const cells = await row.$$("div.row-item");
      const candidate = await page.evaluate((el) => el.innerText, cells[0]);
      const votes = await page.evaluate((el) => el.innerText, cells[1]);
      const party = await page.evaluate((el) => el.innerText, cells[2]);
      result.push({
        candidate,
        votes,
        party:
          party.trim() === "IND"
            ? "Ind"
            : party.trim() === "IND."
            ? "Ind."
            : party,
      });
      console.log(candidate, votes, party);
    }

    candidates2024.push({seat, result});
    
    await browser.close();
  }

  console.log(candidates2024);


  fs.writeFile(
    `./electionsCandidates.json`,
    JSON.stringify(candidates2024),
    (err) => {
      if (err) {
        console.error(err);
      } else {
        // file written successfully
      }
    }
  );
})();
