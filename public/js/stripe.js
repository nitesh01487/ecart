import axios from "axios";
import { showAlert } from "./alert";
const stripe = Stripe('pk_test_51NT3eVSIXlZSJaBBwSzWrVtRRKYxgdgntQf2tINitFAaoV6BdTUVBiRO9WxrrpFxEIcdrvtibLzUtXmWLIwODczq00dkbVfWEB');

export const orderItem = async () => {
    try{
        // 1) Get checkout session from API
    const session = await axios(
        // `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
        `/api/v1/orders/checkout-session`
        );
    console.log(session);

        // 2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
}