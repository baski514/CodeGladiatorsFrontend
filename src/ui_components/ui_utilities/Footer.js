import React from 'react';
// import { Container } from './styles';
import { FaLinkedin, FaInstagramSquare } from "react-icons/fa";
import {GrFacebook} from "react-icons/gr";

function Footer() {
  return (
    <footer className="footer bg-gray-900 relative pt-1 border-b-2 border-gray-400">
        <div className="container mx-auto px-6">
    
            <div className="sm:flex sm:mt-8">
                <div className="mt-8 sm:mt-0 sm:w-full sm:px-8 flex flex-col md:flex-row justify-between">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-100 uppercase mb-2">Connect with US</span>
                        <span className="my-2"><a href="https://www.linkedin.com/company/code-gladiator" className="text-gray-100  text-md hover:text-blue-500"><FaLinkedin className="inline mr-2" size={20}/>Linkedin</a></span>
                        <span className="my-2"><a href="https://www.facebook.com" className="text-gray-100  text-md hover:text-blue-500"><GrFacebook className="inline mr-2" size={20}/>Facebook</a></span>
                        <span className="my-2"><a href="https://www.instagram.com" className="text-gray-100  text-md hover:text-blue-500"><FaInstagramSquare className="inline mr-2" size={20}/>Instagram</a></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-100 uppercase mt-4 md:mt-0 mb-2">Information</span>
                        <span className="my-2"><a href="#" className="text-gray-100 text-md hover:text-blue-500">Blog</a></span>
                        <span className="my-2"><a href="#" className="text-gray-100  text-md hover:text-blue-500">Events</a></span>
                        <span className="my-2"><a href="#" className="text-gray-100 text-md hover:text-blue-500">About Us</a></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-100 uppercase mt-4 md:mt-0 mb-2">Contact Us</span>
                        <span className="my-2"><a href="#" className="text-gray-100 text-md hover:text-blue-500">+91 9910770310</a></span>
                       
                        <span className="my-2"><a href="#" className="text-gray-100 text-md hover:text-blue-500">support@codegladiators.com</a></span>
                        <span className="my-2"><a href="#" className="text-gray-100 text-md hover:text-blue-500">Bengaluru 560078</a></span>
                    
                    </div>
                </div>
            </div>
            <div className="flex flex-row justify-center mt-16">
                <span className="my-0"><a href="https://www.google.com/maps/place/Utilitarian+Labs+Private+Limited/@12.8978444,77.5852734,17z/data=!3m1!4b1!4m5!3m4!1s0x3bae15becdd0aec1:0xc14f3304c4c2b36f!8m2!3d12.8978444!4d77.5874621" target="_blank" className="text-gray-100 text-md hover:text-blue-500">Utilitarian Labs Pvt. Ltd. First Floor, No. 23 19th Cross, 24th Main JP Nagar, 5th Stage</a></span>
            </div>
        </div>
        
        <div className="container mx-auto px-6">
            
            <div className="mt-2 border-t-2 border-gray-300 flex flex-col items-center">
                <div className="sm:w-2/3 text-center py-2">
                    <p className="text-sm text-gray-100 font-bold mb-2">
                        © 2020 by Utilitarian Labs
                    </p>
                </div>
            </div>
        </div>
    </footer>
  );
}

export default Footer;