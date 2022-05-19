import React from 'react'
import { connect } from "react-redux";
import {TiArrowRightThick} from "react-icons/ti";
import { Redirect } from 'react-router-dom';
import StripeCheckout from "react-stripe-checkout";
import {httpsPOST} from "../../backend_api/menteeAPI";
import { API_POST_PAYMENT_CHECKOUT,API_POST_CREATE_CHECKOUT_SESSION} from "../../backend";
import Base from "../Base";

const PaymentGateway = ({ profile, match, location, history }) => {
    console.log(location);
    const paynow = (stripeToken) => {
        
        debugger;
        httpsPOST(null, API_POST_PAYMENT_CHECKOUT, {
            courseMasterId: match.params.courseId,
            studentId: profile.sfid,
            stripeToken,
            amount: location.state.coursePrice,
        }).then((data) => {
            console.log("Payment Response ",JSON.stringify(data))
            debugger;
            if (data) { //TODO: do only if success, else not
                history.push(`/mycourse`);
            }
        });
    };

    const checkOutSession = (e)=> {
        e.preventDefault()
        httpsPOST(null, API_POST_CREATE_CHECKOUT_SESSION, {
            courseMasterId: match.params.courseId,
            studentId: profile.sfid,
            amount: location.state.coursePrice * 100,
        }).then((data) => {
            debugger;
            if (data && data.url) { //TODO: do only if success, else not
                console.log("Session response ",JSON.stringify(data))
                window.location.href = data.url;
            }
        });
    }

    
    return (
        <Base history={history}>
            <div className="container mx-auto py-4 px-12 text-gray-700">
                <center>
                    <h1>Payment</h1>
                </center>
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-10">
                    <div className="md:flex">
                        <div className="md:flex-shrink-0">
                            <img
                                className="h-48 w-full object-cover md:h-full md:w-48"
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQDgab6kXIPCVmxQldH9gmkOmjlgQEDbWAQQ&usqp=CAU"
                                alt=""
                            />
                        </div>
                        <div className="p-6 w-full text-gray-600">
                            <div className="flex flex-col">
                                <h3 className="border-b border-white pb-3 border-b-solid block mb-4 w-full text-center font-bold">
                                    Payment Details
                                </h3>
                                <hr className="mb-3" />
                                <label
                                    htmlFor="card_block"
                                    className="font-bold text-sm"
                                >
                                    Card type
                                </label>
                                <div
                                    id="card_block"
                                    className="flex justify-center gap-2 mt-1"
                                >
                                    <span className="border-gray-600 border-2 rounded-lg p-2 cursor-pointer">
                                        G-Pay
                                    </span>
                                    <span className="border-gray-600 border-2 rounded-lg p-2 cursor-pointer">
                                        Paytm
                                    </span>
                                    <span className="border-gray-600 border-2 rounded-lg p-2 cursor-pointer">
                                        Razor Pay
                                    </span>
                                    <span className="border-gray-600 border-2 rounded-lg p-2 cursor-pointer" >
                               
                                    {/* <form action="http://localhost:8000/api/mentee/create-checkout-session/" method="POST">
                                        <button type="submit">
                                            Checkout
                                        </button>
                                    </form> */}
                                        
                                        <StripeCheckout
                                            stripeKey="pk_test_kHEccy6H5z6OaMQSObdvQIHt003pZDprmp"
                                            token={paynow}
                                            amount={
                                                location.state.coursePrice * 100
                                            }
                                            name="Buy Courses"
                                        >
                                            <button
                                                type="submit"
                                                className="payment-button float-right"
                                            >
                                                Pay by stripe
                                            </button>
                                        </StripeCheckout>


                                    </span>
                                </div>

                                <form className="mt-4 mb-4 text-gray-600">
                                    <div className="mt-6">
                                        <label
                                            className="block text-sm font-bold mb-2"
                                            htmlFor="confirmPassword"
                                        >
                                            Email
                                        </label>
                                        <input
                                            className="shadow appearance-none border rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                            id="confirmPassword"
                                            type="text"
                                            placeholder="email..."
                                        />
                                        {/* <p className="text-red-500 text-xs italic">
                                            Please choose a password.
                                            </p> */}
                                    </div>
                                </form>

                                <div className="flex justify-end mt-5">
                                    <button
                                        className="bg-green-400 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline w-full"
                                        /* onClick={() => {
                                            paynow();
                                        }} */
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="">$1000</span>
                                            <span>
                                                Pay now{" "}
                                                <TiArrowRightThick
                                                    size={20}
                                                    className="text-white inline"
                                                />
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Base>
    );
};

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile,
    };
};

export default connect(mapStateToProps)(PaymentGateway);