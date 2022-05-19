import React from 'react'
import { updateUserProfile } from "../../store/actions/authActions";
import { connect } from "react-redux";
import StripeCheckout from "react-stripe-checkout";
import {httpsPOST} from "../../backend_api/menteeAPI";
import { API_POST_PAYMENT_CHECKOUT} from "../../backend";
import Base from "../Base";
import payIllustrator from '../../assets/payment_illustrator.jpg'
import { toast } from 'react-toastify';
import { firebase } from "../../config/fbConfig";

const CheckoutGateway = ({ auth, profile, match, location, history }) => {
    
    const paynow = (stripeToken) => {    
        firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsPOST({ idToken , uid: auth.uid}, API_POST_PAYMENT_CHECKOUT, {
                    courseMasterId: match.params.courseId,
                    studentId: profile.sfid,
                    stripeToken,
                    amount: location.state.coursePrice,
                }).then((data) => {
                    if (data) {
                        toast.success("Payment successful");
                        history.push({
                            pathname: "/mycourse",
                            state: { recache: true },
                        });
                    }
                });
            });
    };

    /* const checkOutSession = (e)=> {
        e.preventDefault()
        httpsPOST(null, API_POST_CREATE_CHECKOUT_SESSION, {
            courseMasterId: match.params.courseId,
            studentId: profile.sfid,
            amount: location.state.coursePrice * 100,
        }).then((data) => {
            debugger;
            if (data && data.url) {
                console.log("Session response ",JSON.stringify(data))
                window.location.href = data.url;
                // history.push(`/mycourse`);
                //updateProfile({ paid: true });
            }
        });
    } */

    
    return (
        <Base history={history}>

    <div className="grid md:grid-cols-2 h-screen">
            <img src={payIllustrator} alt="Payment illustrator"/>

            <div className="p-4 flex flex-col items-center justify-center bg-gray-100">
                <center>
                    <h1 className="font-bold text-gray-800 text-4xl">Make Payment</h1>
                </center>
                <div className="flex flex-row items-center justify-center">

                <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden md:max-w-2xl mt-8">
                    <div className="md:flex">
                     
                        <div className="p-6 w-full text-gray-600">
                            <div className="flex flex-col items-center justify-center">

                                <img
                                    className="h-20 max-w-md rounded-lg shadow-2xl"
                                    src={location.state.courseDetail.thumbnailURL}
                                    alt=""
                                />
                                <h3 className="text-3xl mt-10 pb-1 border-b-solid block mb-1 w-full text-center font-bold">
                                    {location.state.courseDetail.name}
                                </h3>
                                <h3 className="text-2xl pb-1 border-b-solid block mb-1 w-full text-center font-bold text-gray-800">
                                    {location.state.courseDetail.coursePrice}Rs/-
                                </h3>
                                
                                {/* <label
                                    htmlFor="card_block"
                                    className="font-bold text-sm"
                                >
                                    Card type
                                </label> */}
                                {/* <div
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
                                    <span className="border-gray-600 rounded-lg p-2 cursor-pointer" >
                                        
                                    


                                    </span>
                                </div> */}

                                <form className="mb-4 text-gray-600 w-full mt-5">
                                    <div>
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
                                    </div>
                                </form>

                                <div className="flex justify-end mt-4">

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
                                                className=" cursor-pointer  bg-gradient-to-r from-pink-700 via-pink-600 to-pink-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline w-full shadow-2xl"
                                            >
                                                Pay by stripe
                                            </button>
                                        </StripeCheckout>

                                    {/* <button
                                        className=" cursor-pointer bg-gradient-to-r from-pink-700 via-pink-600 to-pink-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline w-full"
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
                                    </button> */}
                                </div>
                            </div>
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

const mapDispatchToProps = (dispatch) => {
    return {
        updateProfile: (userProfile) =>
            dispatch(updateUserProfile(userProfile))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutGateway);