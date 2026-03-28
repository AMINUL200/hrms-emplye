import React, { useContext, useState } from "react";
import { logo2, car1, car2, car3 } from "../../assets";
import DotLoader from "../../component/common/DotLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEyeSlash,
  faEye,
  faUserFriends,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import Carousel from "../../component/common/Carousel";
import { AuthContext } from "../../context/AuthContex";

const GuestLoginPage = () => {
  const { guestLogin, isLoading } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toggle, setToggle] = useState(false);
  const navigate = useNavigate();

  // Pre-filled guest credentials

  const handleGuestLogin = async (e) => {
    e.preventDefault();
    await guestLogin(email, password);
  };

  const handleRegularLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="main-wrapper guest-login-page">
      <div className="account-content">
        <div className="container">
          <div className="row">
            {/* Left side - Carousel */}
            <div className="col-md-6  p-0">
              <Carousel img1={car1} img2={car2} img3={car3} />
            </div>

            {/* Right side - Login form */}
            <div className="col-md-6 login-form-wrapper">
              <div className="account-details">
                {/* <!-- Account Logo --> */}
                <div className="account-logo">
                  <img
                    src={logo2}
                    alt="Dreamguy's Technologies"
                    className="login-logo"
                  />
                </div>
                {/* <!-- /Account Logo --> */}
                {/* Guest Login Badge */}
                {/* <div className="guest-badge mb-3">
                  <span className="guest-tag">
                    <FontAwesomeIcon icon={faUserFriends} className="me-2" />
                    Guest Access
                  </span>
                </div> */}

                {/* <!-- Account Form --> */}
                <div className="account-box">
                  <div children="account-wrapper">
                    <h3 className="account-title">Guest Login</h3>
                    <p className="account-subtitle">
                      Try our platform with demo access
                    </p>

                    <form onSubmit={handleGuestLogin}>
                      <div className="input-block mb-4">
                        <label className="col-form-label">Guest Email</label>
                        <input
                          className="form-control"
                          type="mail"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="Enter your Email.."
                        />
                      </div>
                      <div className="input-block mb-4">
                        <div className="row align-items-center">
                          <div className="col">
                            <label className="col-form-label">
                              Guest Password
                            </label>
                          </div>
                        </div>
                        <div className="position-relative">
                          <input
                            className="form-control"
                            type={toggle ? "text" : "password"}
                            value={password}
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your Password"
                          />
                          <span
                            className="toggle-icon"
                            onClick={() => setToggle(!toggle)}
                          >
                            <FontAwesomeIcon
                              icon={toggle ? faEye : faEyeSlash}
                            />
                          </span>
                        </div>
                      </div>
                      <div className="input-block mb-4 text-center">
                        <button
                          className={` account-btn ${isLoading ? "disable-btn" : ""}`}
                          type="submit"
                          disabled={isLoading}
                        >
                          {isLoading ? <DotLoader /> : "Login as Guest"}
                        </button>
                      </div>

                      <div className="guest-divider">
                        <span>OR</span>
                      </div>

                      <div className="input-block mb-4 text-center">
                        <button
                          type="button"
                          className="regular-login-btn"
                          onClick={handleRegularLoginRedirect}
                        >
                          Regular User Login
                        </button>
                      </div>
                      <div className="account-footer">
                        <p>
                          Need full access?{" "}
                          <Link to="/register">Register Account</Link>
                        </p>
                      </div>
                    </form>
                    {/* <!-- /Account Form --> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestLoginPage;
