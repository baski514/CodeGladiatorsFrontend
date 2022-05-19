import React, {useState } from 'react'
import Alert from "../../ui_utilities/Alert";
import { updateUserInfo } from "../../../store/actions/authActions";
import { connect } from "react-redux";
import { LoaderLarge } from "../../ui_utilities/Loaders";

import {API_POST_CREATE_BANK_DETAILS} from  '../../../backend'
import { httpsPOST } from "../../../backend_api/mentorAPI";

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';


const schema = yup.object().shape({
    bankName: yup.string().required(),
    accountNo: yup.string().required(),
    holderName: yup.string().required(),
    bankAddress: yup.string().required(),
    ifscCode: yup.string().required()
  });
  
const AdditionalDetails = ({ bankDetails,sfid}) => {

    console.log("SFID ",sfid)
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
      });
      

      
console.log("Bank Details ",bankDetails.length)

      const [localBankDetails,setLocalBankDetails] = useState({
            bankName:bankDetails.bankName?bankDetails.bankName:"",
            accountNo:bankDetails.accountNo?bankDetails.accountNo:"",
            holderName:bankDetails.holderName?bankDetails.holderName:"",
            bankAddress:bankDetails.bankAddress?bankDetails.bankAddress:"",
            ifscCode:bankDetails.ifscCode?bankDetails.ifscCode:"",

      })

    if(bankDetails.length>0){
        setLocalBankDetails(bankDetails)
    }

    const [alert, setAlert] = useState({
        color: "rose",
        message: "please fill all necessary details.",
    });
    const [showAlert, setShowAlert] = useState(false);
    const [showLoader, setShowLoader] = useState(false);



    // console.log(localProfile);
    const onSubmit = (e) => {
        
        console.log("FORCEID ",sfid)
        const body = {
            Contact__c: sfid,
            Bank_Name__c: localBankDetails.bankName,
            Bank_Account_Number__c:localBankDetails.accountNo,
            Bank_Holder_Name__c:localBankDetails.holderName,
            Bank_Address__c:localBankDetails.bankAddress,
            Bank_IFSC_Code__c:localBankDetails.ifscCode
        }

        try {
            httpsPOST(null, API_POST_CREATE_BANK_DETAILS,body).then(
                (data) => {
                    console.log("BANK DETAILS RESP ",body)
                    if (data && data.error) {
                        toast.error(data.error)
                        setAlert({ ...alert, message: data.error });
                        setShowAlert(true);
                    } else if (data && data.id) {
                        toast.success("Bank details created")
                    }
                }
            );
        } catch (error) {
            toast.error(error)   
        }
    };

    const handleChange = (e) => {
        setLocalBankDetails({...localBankDetails,
            [e.target.id]: e.target.value,
        });
    };

    const handleAlerts = (alertType) => (event) => {
        if (alertType === "CLOSE")
            this.setState({ ...this.state, showAlert: false });
    };

    return (
        <>
            {showLoader ? (
                <div className="flex items-center justify-center h-3/6">
                    <LoaderLarge type="ThreeDots" />
                </div>
            ) : (
                <form className=""  onSubmit={handleSubmit(onSubmit)}>
                    {showAlert && (
                        <Alert alert={alert} clickHandler={handleAlerts} />
                    )}
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="username"
                        >
                            Bank Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="bankName"
                            type="text"
                            placeholder="Bank Name"
                            {...register("bankName")} // custom message
                            onChange={handleChange}
                            value={localBankDetails.bankName}
                            
                        />
                        <p className="text-red-700">{errors.bankName?"Enter Bank Name":""}</p>
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="username"
                        >
                            Account Number
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="accountNo"
                            type="number"
                            placeholder="Account Number"
                            value={localBankDetails.accountNo}
                            {...register("accountNo")} // custom message
                            onChange={handleChange}
                        />
                          <p className="text-red-700">{errors.accountNo?"Enter Account Number":""}</p>
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="holderName"
                        >
                            Account Holder Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="holderName"
                            type="text"
                            placeholder="Account Holder Name"
                            value={localBankDetails.holderName}
                            {...register("holderName")} // custom message
                            onChange={handleChange}
                        />
                        <p className="text-red-700">{errors.holderName?"Enter Holder Name":""}</p>
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="bankAddress"
                        >
                            Bank Address
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="bankAddress"
                            type="text"
                            placeholder="Bank Address"
                            value={localBankDetails.bankAddress}
                            {...register("bankAddress")} // custom message
                            onChange={handleChange}
                        />
                        <p className="text-red-700">{errors.bankAddress?"Enter Bank Address":""}</p>
                    </div>
                    
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="ifscCode"
                        >
                            IFSC CODE
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="ifscCode"
                            type="text"
                            placeholder="IFSC CODE"
                            value={localBankDetails.ifscCode}
                            {...register("ifscCode")} // custom message
                            onChange={handleChange}
                        />
                        <p className="text-red-700">{errors.ifscCode?"Enter IFSC Code ":""}</p>
                    </div>
                    
                    <div className="flex justify-center">
                        <button
                            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                            type="submit"
                        >
                            Update
                        </button>
                    </div>
                </form>
            )}
        </>
    );
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateProfile: (localProfile) =>
            dispatch(updateUserInfo(localProfile,"Profile Updated")),
    };
};

export default connect(null, mapDispatchToProps)(AdditionalDetails);