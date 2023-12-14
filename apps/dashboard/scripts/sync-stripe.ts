import {
  stripe,
  upsertPriceRecord,
  upsertProductRecord,
} from "~/lib/stripe.server";

const main = async () => {
  // first we pull all products from Stripe and insert them into the billing_products table
  await stripe.products
    .list()
    .then(async (products) => {
      for (const product of products.data) {
        await upsertProductRecord(product);
      }
    })
    .catch((e) => {
      console.log(e);
    });

  // then we pull all prices from Stripe and insert them into the billing_prices table
  await stripe.prices
    .list({
      limit: 100,
    })
    .then(async (prices) => {
      for (const price of prices.data) {
        await upsertPriceRecord(price);
      }
    })
    .catch((e) => {
      console.log(e);
    });
};

main();
