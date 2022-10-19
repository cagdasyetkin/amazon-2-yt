import { useSession, getSession } from "next-auth/react";
import React from "react";
import Header from "../components/Header";
import moment from "moment";
import db from "../../firebase";
import Order from "../components/Order";

// do server side rendering for the orders page, pre-render the page

function Orders({ orders }) {
  const { data: session } = useSession();

  return (
    <div>
      <Header />
      <main className="max-w-screen-lg mx-auto p-10">
        <h1 className="text-3xl border-b mb-2 pb-1 border-yellow-400">
          Your Orders
        </h1>
        {session ? (
          <h2>{session.user.email}</h2>
        ) : (
          <h2>Please sign in to see your orders</h2>
        )}

        <h2>{orders.length} Orders</h2>

        <div className="mt-5 space-y-4">
          {orders?.map(
            ({ id, amount, amountShipping, items, timestamp, images }) => (
              <Order
                key={id}
                id={id}
                amount={amount}
                amountShipping={amountShipping}
                items={items}
                timestamp={timestamp}
                images={images}
              />
            )
          )}
        </div>
      </main>
    </div>
  );
}

export default Orders;

export async function getServerSideProps(context) {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  // Get the user logged in credentials/clearance

  // it is a promise, so we need to await it
  const session = await getSession(context);

  if (!session) {
    return {
      props: {},
    };
  }

  // Firebase db

  const stripeOrders = await db
    .collection("users")
    .doc(session.user.email)
    .collection("orders")
    .orderBy("timestamp", "desc")
    .get();

  // Stripe orders
  const orders = await Promise.all(
    // map through each order and get the data
    // each one would be a promise. so Promise.all will wait
    //for all of them to resolve
    stripeOrders.docs.map(async (order) => ({
      id: order.id,
      amount: order.data().amount, // / 100,
      //amountShipping: order.data().amount_shipping / 100,
      images: order.data().images,
      // get the timestamp from firebase and convert it to a date object
      // so we can format it
      timestamp: moment(order.data().timestamp.toDate()).unix(),
      items: (
        await stripe.checkout.sessions.listLineItems(order.id, {
          limit: 100,
        })
      ).data,
    }))
  );

  return {
    props: {
      orders,
    },
  };
}
