const initState = {
  authError: null,
};

const authReducer = (state = initState, action) => {
    switch (action.type) {
        case "LOGIN_ERROR":
            console.log("login error");
            return {
                ...state,
                authError:{header:"Warning",msg:"",color:"bg-yellow-500"},
            };

        case "LOGIN_SUCCESS":
            console.log("login success");
            return {
                ...state,
                authError: null,
            };

        case "SIGNUP_SUCCESS":
            console.log("signup success");
            return {
                ...state,
                authError: null,
            };
        case "SIGNOUT_SUCCESS":
            console.log("signout success");
            return {
                ...state,
                authError: {type:"SIGNOUT_SUCCESS"},
            };    

        case "INCORRECT_CREDENTIAL":
            console.log("Credential Were wrong")
            return{
                ...state,
                authError:{header:"Incorrect",msg:"credentials",color:"bg-red-400"}    
            }

        case "EMAIL_NOT_VERIFIED":
            console.log("EMAIL NOT VERIFIED");
            return {
                ...state,
                authError:{header:"Warning",msg:"Email not verified yet",color:"bg-yellow-500"}
            }    

        case "SIGNUP_ERROR":
            console.log("signup error "+JSON.stringify(action));
            
            return {
                ...state,
                authError: {header:"Went worng! ",msg:action.msg,color:"bg-red-400"},
            };

        case "VERIFIY_EMAIL":
            console.log("Email Verification Sent");
            return {
                ...state,
                authError:{header:"Verify",msg:"your email!",color:"bg-green-600"}
            }   

        case "PASSWORD_REGEX_SUCCESS":
            console.log("Password has special characters")
            return{
                ...state,
                authError:null
            }    
        
        case "RESET_PASSWORD_ERROR":
            console.log("Reset password error "+JSON.stringify(action));
            
            return {
                ...state,
                authError: {header:"Account ! ",msg:"doesn't exist",color:"bg-red-400"},
            };    

        case "RESET_PASSWORD_SUCCESS":
            console.log("Email Verification Sent");
            return {
                ...state,
                authError:{header:"Reset ",msg:"Password link sent!",color:"bg-green-600"}
            }       
        case "MARK_ALL_AS_READ":
            console.log("MARK_ALL_AS_READ")
            return{
                ...state,
                authError:null
            }    
        case "MARK_ALL_AS_READ_ERROR":
            console.log("MARK_ALL_AS_READ_ERROR")
            return{
                ...state,
                authError: {header:"Error",msg:"to mark read all",color:"bg-red-400"},
            }        

        default:
            return state;
    }
};

export default authReducer;
