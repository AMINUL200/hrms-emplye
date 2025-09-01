import React from 'react'
import { logo2, car1, car2, car3 } from '../../assets';
import { Link } from 'react-router-dom';
import Carousel from '../../component/common/Carousel';
const RegisterPage = () => {
    return (
        <div className="main-wrapper">
            <div className="account-content">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 text-center register-form-wrapper">
                            <div className="row">

                                <div className="reg-main-right pt-0">
                                    <div className="acc-header">
                                        {/* <!-- Account Logo --> */}
                                        <div className="account-logo">
                                            <img src={logo2} alt="Dreamguy's Technologies" className="login-logo" />
                                        </div>
                                        {/* <!-- /Account Logo --> */}
                                        <div className="account-title">
                                            <h2>Register Here</h2>
                                        </div>
                                    </div>
                                    <form action="" className="acc-body">
                                        {/* input select */}
                                        <div className='input-block mb-2'>
                                            <label for="country">Select Type *</label>
                                            <select name="country" id="country">
                                                <option value="">Select Type</option>
                                                <option value="1">Partner</option>
                                                <option value="2">Organization </option>
                                            </select>
                                        </div>
                                        {/* input Organization */}
                                        <div className='input-block anime mb-2'>
                                            <label for="organization">Organization Name *</label>
                                            <input type="text" name="organization" id="organization" required placeholder='Organization name' />
                                        </div>
                                        {/* input first-name */}
                                        <div className='input-block mb-2'>
                                            <label for="first-name">First Name *</label>
                                            <input type="text" name="first-name" id="first-name" required placeholder='First Name' />
                                        </div>
                                        {/* input last-name */}
                                        <div className='input-block mb-2'>
                                            <label for="last-name">Last Name *</label>
                                            <input type="text" name="last-name" id="last-name" required placeholder='Last Name' />
                                        </div>
                                        {/* input email */}
                                        <div className='input-block mb-2'>
                                            <label for="email">Email *</label>
                                            <input type="email" name="email" id="email" required placeholder='Email' />
                                        </div>
                                        {/* select country */}
                                        <div className='input-block mb-2'>
                                            <label for="country">Country *</label>
                                            <select name="country" id="country">
                                                <option value="">Select Country</option>
                                                <option value="1">USA</option>
                                                <option value="2">UK</option>
                                                <option value="3">Canada</option>
                                            </select>
                                        </div>
                                        {/* select country code */}
                                        <div className='input-block mb-2'>
                                            <label for="country-code">Country Code *</label>
                                            <input type="text" name="country-code" id="country-code" required placeholder='Country Code' />
                                        </div>
                                        {/* input contact number */}
                                        <div className='input-block mb-2'>
                                            <label for="contact-number">Your Contact Number *</label>
                                            <input type="text" name="contact-number" id="contact-number" required placeholder='Contact Number' />
                                        </div>
                                        {/* input password */}
                                        <div className='input-block mb-2'>
                                            <label for="password">Password *</label>
                                            <input type="password" name="password" id="password" required placeholder='Password' />
                                        </div>
                                        {/* input confirm password */}
                                        <div className='input-block mb-2'>
                                            <label for="confirm-password">Confirm Password *</label>
                                            <input type="password" name="confirm-password" id="confirm-password" required placeholder='Confirm Password' />
                                        </div>
                                        {/* checkbox */}
                                        <div className='input-block-check mb-2'>
                                            <input type="checkbox" id="terms-conditions1" name="terms-conditions" required />
                                            <label for="terms-conditions">I confirm that I have read the Privacy Policy and I agree to the website Terms of Use and License Agreement</label>
                                        </div>
                                        {/* checkbox */}
                                        <div className='input-block-check mb-2'>
                                            <input type="checkbox" id="terms-conditions2" name="terms-conditions" required />
                                            <label for="terms-conditions">I understand that they do not, in any way, replace immigration advice</label>
                                        </div>
                                        {/* submit button */}
                                        <div className='input-block mb-2'>
                                            <button type="submit">Register</button>
                                        </div>
                                        {/* <!-- /Form --> */}

                                        {/* Account footer */}
                                        <div className="account-footer">
                                            <p>Already have an account? <Link to='/login'>Login</Link></p>
                                        </div>
                                    </form>
                                </div>

                            </div>





                        </div>
                        <div className="col-lg-6 text-center p-0">
                            <Carousel img1={car1} img2={car1} img3={car1} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
