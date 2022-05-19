import { React, useState } from "react";
import { randomColor } from "randomcolor";
import AccountModal from "../modal/AccountModal";
import Alert from "../../ui_utilities/Alert";
import { httpsPOST, httpsDELETE } from "../../../backend_api/mentorAPI";
import { API_POST_CREATE_BANK_DETAILS, API_POST_EDIT_BANK_DETAILS, API_DELETE_BANK_DETAILS} from "../../../backend";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ifsc from 'ifsc'
  

const AdditionalDetails = ({bankDetails, sfid, addBankDetailsHandler, deleteBankDetailsHandler}) => {



    const [showAlert, setShowAlert] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);   
    const [errors, ValidateError] = useState({Bank_Name__c:false,Bank_Account_Number__c:false,Bank_Holder_Name__c:false,Bank_Address__c:false,Bank_IFSC_Code__c:false});
    
    let primaryAccontId;
  
    if(bankDetails){
        for(let i=0; i<bankDetails.length;i++){
            if(bankDetails[i].Primary__c){
                primaryAccontId = bankDetails[i]
                break;
            }
        }
    }
  


    const [alert, setAlert] = useState({
        className: "bg-red-400",
        message: "please fill all necessary details.",
    });

    const [bankDetail, setBankDetail] = useState({Bank_Name__c:"",Bank_Account_Number__c:"",Bank_Holder_Name__c:"",Bank_Address__c:"",Bank_IFSC_Code__c:"",Contact__c:sfid,Primary__c:false});

    const handleChange = (e) => {
        setBankDetail({ ...bankDetail,[e.target.id]: e.target.value });
    };

    const handlePrimary = (e) => {
        setBankDetail({ ...bankDetail,[e.target.id]: e.target.value });
        bankDetail.Primary__c = true
        handleEvent("SAVE")
    }

    
    const handleAlerts = (alertType) => (event) => {
        if (alertType === "CLOSE")
            setShowAlert(false);
    };

    const editExpHandler = (details) => {
        delete details["attributes"];
        setBankDetail(details);
        setIsEdit(true);
        setShowModal(true);
    }
    
    const deleteAccount = (expId) => {
        console.log(expId);
        if(window.confirm('Are you sure you want to delete')) {
            httpsDELETE(null, API_DELETE_BANK_DETAILS + expId).then((data) => {
                if (data && data.error) {
                    console.log("ERROR from SERVER");
                } else if (data && data.success) {
                    deleteBankDetailsHandler(expId);
                }
            });
            
        }
    }

    const resetState = () => {
        setBankDetail({Bank_Name__c:"",Bank_Account_Number__c:"",Bank_Holder_Name__c:"",Bank_Address__c:"",Bank_IFSC_Code__c:"",Contact__c:"",Primary__c:false});
        setIsEdit(false);
        setShowModal(false);
    }

    const handleEvent = (type) => {
        if (type === "CLOSE") {
           resetState();
        }else if (type === "SHOW_MODAL") {
            setShowModal(true);
        } else if (type === "SAVE") {
            
            
            if(bankDetail.Bank_Name__c.length===0){
                ValidateError({
                    Bank_Name__c:true,
                    Bank_Account_Number__c:false,
                    Bank_IFSC_Code__c:false,
                    Bank_Holder_Name__c:false,
                    Bank_Address__c:false
                })
            }else if(bankDetail.Bank_Account_Number__c.length===0){
                ValidateError({
                    Bank_Name__c:false,
                    Bank_Account_Number__c:true,
                    Bank_IFSC_Code__c:false,
                    Bank_Holder_Name__c:false,
                    Bank_Address__c:false
                })
            }
            else if(bankDetail.Bank_IFSC_Code__c.length===0 || !ifsc.validate(bankDetail.Bank_IFSC_Code__c)){
                ValidateError({
                    Bank_Name__c:false,
                    Bank_Account_Number__c:false,
                    Bank_IFSC_Code__c:true,
                    Bank_Holder_Name__c:false,
                    Bank_Address__c:false
                })
            }
            else if(bankDetail.Bank_Holder_Name__c.length===0){
                ValidateError({
                    Bank_Name__c:false,
                    Bank_Account_Number__c:false,
                    Bank_IFSC_Code__c:false,
                    Bank_Holder_Name__c:true,
                    Bank_Address__c:false
                })
            }
            else if(bankDetail.Bank_Address__c.length===0){
                ValidateError({
                    Bank_Name__c:false,
                    Bank_Account_Number__c:false,
                    Bank_IFSC_Code__c:false,
                    Bank_Holder_Name__c:false,
                    Bank_Address__c:true
                })
            }else{
                if (bankDetail.Name !== "") {

                    bankDetail.Contact__c = sfid
    
                    let body;
    
                    if(primaryAccontId && bankDetail.Primary__c ){
                        bankDetail.Primary__c = true
                        body={
                            current:bankDetail, 
                            prev:primaryAccontId
                        }
                    }else{
                        bankDetail.Primary__c = bankDetails.length===0 || (bankDetails.length>0 && !bankDetails[0].Primary__c)?true:false
                        body={
                            current:bankDetail,
                            prev:null
                        }
                    }
                    
                    httpsPOST(null, isEdit ? API_POST_EDIT_BANK_DETAILS + sfid : API_POST_CREATE_BANK_DETAILS, body).then(
                        (data) => {
                            if (data && data.error) {
                                setAlert({ ...alert, message: data.error });
                                setShowAlert(true);
                            } else if (data && data.id) {
                                const newExperience = bankDetail;
                                newExperience.Id = data.id;
                                addBankDetailsHandler(newExperience, isEdit);
                                resetState();
                            }
                        }
                    );
                }
                else {
                    setAlert({ ...alert, message: "Please fill all necessary details" });
                    setShowAlert(true);
                }
            }    
        }
    };

    const bankDetailCard = () => {
        console.log("Bank details calling")
        return (
            <div className="mt-5">
                {bankDetails &&
                    bankDetails.map((detail, index) => {
                        console.log("Detail ",detail)
                        return (
                            <div
                                className="no-underline border-b hover:border-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-2 p-5 text-gray-900"
                                key={index}
                                style={{
                                    backgroundColor: randomColor({
                                        luminosity: "light",
                                        hue: "random",
                                    }),
                                }}
                            >
                                <div className="md:flex md:justify-between">
                                    
                                    <div>
                                    
                                        <b>{detail.Bank_Name__c}</b>
                                        <p className="text-sm">
                                            <b>Account no: </b>
                                            {detail.Bank_Account_Number__c}
                                        </p>
                                        <p className="text-sm">
                                            <b>IFSC Code: </b>
                                            {detail.Bank_IFSC_Code__c}
                                        </p>
                                    </div>
                                    

                                    <div className="flex items-center">
                                        {console.log("IsPrimary ",detail.Primary__c)}

                                        {detail.Primary__c?<h1 className="mr-5 text-xs">Primary</h1>:null}
                                  
                                        <FaTrash
                                            className="inline cursor-pointer text-gray-600 hover:text-black"
                                            size={20}
                                            onClick={() =>
                                                deleteAccount(detail.Id)
                                            }
                                        />
                                        <FaPencilAlt
                                            className="inline cursor-pointer ml-4 text-gray-600 hover:text-black"
                                            size={20}
                                            onClick={() =>
                                                editExpHandler(detail)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>
        );
    };

    const addNewDetail = () => {
        return (
            <form className="">
                {showAlert && (
                    <Alert alert={alert} clickHandler={handleAlerts} />
                )}
                <div className="grid grid-cols-2 gap-16">
                    <div className="col-span-1">
                        <div className="mb-10">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="username"
                            >
                                Bank Name
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="Bank_Name__c"
                                type="text"
                                placeholder="Bank Name"
                                onChange={handleChange}
                                value={bankDetail.Bank_Name__c}
                            />
                            <p className="text-red-700">{errors.Bank_Name__c?"Enter Bank name":""}</p>
                        </div>
                        <div className="mb-6">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="account number"
                            >
                                Account Number
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="Bank_Account_Number__c"
                                type="number"
                                placeholder="Account Number"
                                onChange={handleChange}
                                value={bankDetail.Bank_Account_Number__c}
                            />
                            <p className="text-red-700">{errors.Bank_Account_Number__c?"Enter Account Number":""}</p>
                        </div>
                        {
                            bankDetails.length>0?
                            <div className="mb-6">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="account number"
                            >
                                Primary Account
                            </label>
                            <input
                                className=""
                                id="Primary__c"
                                type="checkbox"
                                onChange={handleChange}
                                checked={bankDetail.Primary__c}
                            />
                        </div>:null
                        }
                       

                    </div>
                    <div className="col-span-1">
                        <div className="mb-6">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="ifsc"
                            >
                                IFSC Code
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="Bank_IFSC_Code__c"
                                type="text"
                                placeholder="IFSC Code"
                                onChange={handleChange}
                                value={bankDetail.Bank_IFSC_Code__c}
                            />
                            <p className="text-red-700">{errors.Bank_IFSC_Code__c?"Invalid Ifsc code":""}</p>
                        </div>
                        <div className="mb-6">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="password"
                            >
                                Holder Name
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="Bank_Holder_Name__c"
                                type="text"
                                placeholder="Account Holder Name"
                                onChange={handleChange}
                                value={bankDetail.Bank_Holder_Name__c}
                            />
                            <p className="text-red-700">{errors.Bank_Holder_Name__c?"Enter Holder Number":""}</p>
                        </div>

                        <div className="mb-6">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="bankAddress"
                            >
                                Bank Address
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="Bank_Address__c"
                                type="text"
                                placeholder="Bank Address"
                                onChange={handleChange}
                                value={bankDetail.Bank_Address__c}
                            />
                            <p className="text-red-700">{errors.Bank_Address__c?"Enter Bank Address":""}</p>
                        </div>
                    </div>
                </div>
            </form>
        );
    };
    return (
        <div className="flex flex-col">
            <div className="md:flex md:justify-between border-b border-gray-300 p-3">
                <h3>Bank Details</h3>
                <AccountModal title={isEdit ? "Edit Details" : "Add Account"} handleEvent={handleEvent} showModal={showModal}>
                    {addNewDetail()}
                </AccountModal>
            </div>
            {bankDetailCard()}
        </div>
    );
};

export default AdditionalDetails;