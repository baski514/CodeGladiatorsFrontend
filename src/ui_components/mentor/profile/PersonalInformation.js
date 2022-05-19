import React, {useState } from 'react'
import Alert from "../../ui_utilities/Alert";
import { updateUserInfo } from "../../../store/actions/authActions";
import { connect } from "react-redux";
import { LoaderLarge } from "../../ui_utilities/Loaders";

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';


const schema = yup.object().shape({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
  });
  


const PersonalInformation = ({ profile, auth, updateProfile }) => {
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
      });
    

    const [localProfile, setLocalProfile] = useState({
        email:auth.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        description: profile.description ? profile.description : "",
        location: profile.location?profile.location:"",
        role: profile.role?profile.role:"",
        qualification: profile.qualification?profile.qualification:"",
        gender:profile.gender?profile.gender:"",
        phone:profile.phone?profile.phone:"",
        shortDescription:profile.shortDescription?profile.shortDescription:"",
        lastModifiedBy:profile.lastModifiedBy?profile.lastModifiedBy:new Date()
    });
    const [alert, setAlert] = useState({
        color: "rose",
        message: "please fill all necessary details.",
    });
    const [showAlert, setShowAlert] = useState(false);

    const [showLoader, setShowLoader] = useState(false);



    console.log(localProfile);
    const onSubmit = (e) => {
        setLocalProfile({...localProfile,lastModifiedBy:new Date()})
        console.log(localProfile);
        updateProfile(localProfile);
    };

    const handleChange = (e) => {
        setLocalProfile({...localProfile,
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
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                            id="email"
                            type="text"
                            placeholder="firstName"
                            value={auth.email}
                            disabled
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="username"
                        >
                            First Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="firstName"
                            type="text"
                            placeholder="firstName"
                            value={localProfile.firstName}
                            {...register("firstName")} // custom message
                            onChange={handleChange}
                        />
                          <p className="text-red-700">{errors.firstName?"Enter First Name":""}</p>
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="lastName"
                        >
                            Last Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="lastName"
                            type="text"
                            placeholder="lastName"
                            value={localProfile.lastName}
                            {...register("lastName")} // custom message
                            onChange={handleChange}
                        />
                        <p className="text-red-700">{errors.lastName?"Enter Last Name":""}</p>
                    </div>

                    
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="lastName"
                        >
                            Phone number
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="phone"
                            placeholder="Phone number"
                            type="number"
                            value={localProfile.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="lastName"
                        >
                            Gender
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="gender"
                            type="text"
                            placeholder="gender"
                            value={localProfile.gender}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="lastName"
                        >
                            Primary Location
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="location"
                            placeholder="Primary Location"
                            type="text"
                            value={localProfile.location}
                            onChange={handleChange}
                        />
                    </div>
                    {
                        profile.userType==="instructor"?
                        <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="lastName"
                        >
                            Organization Role
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="role"
                            type="text"
                            placeholder="Organization Role"
                            value={localProfile.role}
                            onChange={handleChange}
                        />
                    </div>:null
                    }
                   
                    
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="lastName"
                        >
                            Highest Qualification
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="qualification"
                            type="text"
                            placeholder="Qualification"
                            value={localProfile.qualification}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="shortDescription"
                        >
                            Short description
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="shortDescription"
                            placeholder="Short Description"
                            type="text"
                            value={localProfile.shortDescription}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="aboutYourself"
                        >
                            About Yourself ?
                        </label>
                        <textarea
                            id="description"
                            name="aboutYourself"
                            rows="4"
                            cols="50"
                            placeholder="Write something that express you"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            type="textarea"
                            value={localProfile.description}
                            onChange={handleChange}
                        />
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

export default connect(null, mapDispatchToProps)(PersonalInformation);