// api/scrapeHotels.js
import puppeteer from "puppeteer";
import fs from "fs";

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(
      `https://www.booking.com/searchresults.html?ss=Abuja&ssne=Abuja&ssne_untouched=Abuja&label=gen173nr-1FCAEoggI46AdIM1gEaKcBiAEBmAExuAEXyAEM2AEB6AEB-AECiAIBqAIDuALBw9m0BsACAdICJGJhMjA2M2EwLThmZTItNDNkOS04ZDY0LTM5Y2RmNWYyNmNjZNgCBeACAQ&aid=304142&lang=en-us&sb=1&src_elem=sb&src=index&dest_id=-1997013&dest_type=city&checkin=2024-07-16&checkout=2024-07-17&group_adults=1&no_rooms=1&group_children=0`,
      { waitUntil: "networkidle2" }
    );

    const hotels = await page.evaluate(async () => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      let lastElement = [
        ...document.querySelectorAll('[data-testid="property-card"]'),
      ].pop();

      let hotelElements = [];

      if (lastElement) {
        lastElement?.scrollIntoView();
        let check = null;
        for (let index = 0; index < 100; index++) {
          [...document.querySelectorAll('[data-testid="property-card"]')]
            .pop()
            ?.scrollIntoView();
          let readMore = [...document.querySelectorAll("button")].filter(
            (el) => el.textContent === "Load more results"
          )[0];
          if (readMore) {
            check = "Button is on the dom";
            console.log(check);
            break;
          }
          await sleep(2000);
        }

        for (let index = 0; index < 100; index++) {
          let readMore = [...document.querySelectorAll("button")].filter(
            (el) => el.textContent === "Load more results"
          )[0];
          [...document.querySelectorAll('[data-testid="property-card"]')]
            .pop()
            .scrollIntoView();
          if (!readMore) {
            check = "Button is no longer on the dom";
            const hotelData = [
              ...document.querySelectorAll('[data-testid="property-card"]'),
            ].map((hotel) => {
              // Extract hotel name
              const name =
                hotel
                  .querySelector(`h3 div[data-testid="title"]`)
                  ?.innerText.trim() || "N/A";

              // Extract hotel star rating
              const starRating = hotel.querySelector(
                `[data-testid="rating-stars"]`
              )
                ? hotel.querySelector(`[data-testid="rating-stars"]`).childNodes
                    .length
                : null;

              // Extract hotel location
              const location =
                hotel
                  .querySelector(`span[data-testid="address"]`)
                  ?.innerText.trim() || "N/A";

              // Extract ratings
              const ratingsElement = hotel.querySelector(
                `[data-testid="review-score"] .d0522b0cca`
              );
              const ratings =
                ratingsElement?.childNodes.length > 1
                  ? Number(ratingsElement.childNodes[1]?.textContent)
                  : null;

              // Extract reviews
              const reviewsElement = hotel.querySelector(
                `[data-testid="review-score"] .c324bdcee4`
              );
              const reviews =
                reviewsElement?.childNodes.length > 1
                  ? reviewsElement.childNodes[1]?.textContent
                  : null;

              const descriptions = hotel.querySelector(
                `div[data-testid="property-card"] div[data-testid="property-card-container"] .c655c9a144 .adc8292e09 .c324bdcee4 .adc8292e09 `
              ).childNodes[2].textContent;

              hotelElements.push({
                name,
                location,
                ratings,
                starRating,
                reviews,
                descriptions,
              });
            });
            console.log(check);
            break;
          }
          readMore?.click();
          await sleep(5000);
        }
      }

      console.log(hotelElements);

      return hotelElements;
    });

    fs.writeFileSync("hotelsData.json", JSON.stringify(hotels, null, 2));
    console.log("Scraped data saved to hotelsData.json");
    await browser.close();
  } catch (error) {
    res.status(500).json({ error: "Failed to scrape data" });
  }
})();
