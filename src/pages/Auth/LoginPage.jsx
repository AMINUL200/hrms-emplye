import React, { useContext, useState } from 'react';
import { logo2, car1, car2, car3 } from '../../assets';
import DotLoader from '../../component/common/DotLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import Carousel from '../../component/common/Carousel';
import { AuthContext } from '../../context/AuthContex';

const LoginPage = () => {
	const { loginUser, isLoading } = useContext(AuthContext);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [toggle, setToggle] = useState(false);


	const handleLogin = async (e) => {
		e.preventDefault();
		await loginUser(email, password);
	};

	return (
		<div className="main-wrapper">
			<div className="account-content">
				<div className="container">
					<div className="row">


						{/* Left side - Carousel */}
						<div className="col-md-6  p-0">
							<Carousel img1={car1} img2={car2} img3={car3} />
						</div>

						{/* Right side - Login form */}
						<div className="col-md-6 login-form-wrapper">

							<div className='account-details'>
								{/* <!-- Account Logo --> */}
								<div className="account-logo">
									<img src={logo2} alt="Dreamguy's Technologies" className="login-logo" />
								</div>
								{/* <!-- /Account Logo --> */}

								{/* <!-- Account Form --> */}
								<div className="account-box">
									<div children="account-wrapper">
										<h3 className="account-title">Login</h3>
										<p className="account-subtitle">Access to our dashboard</p>


										<form onSubmit={handleLogin}>
											<div className="input-block mb-4">
												<label className="col-form-label">Email Address</label>
												<input className="form-control" type="mail" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder='Enter your Email..' />
											</div>
											<div className="input-block mb-4">
												<div className="row align-items-center">
													<div className="col">
														<label className="col-form-label">Password</label>
													</div>

												</div>
												<div className="position-relative">
													<input className="form-control" type={toggle ? 'text' : 'password'} value={password} id="password" onChange={(e) => setPassword(e.target.value)} required placeholder='Enter your Password' />
													<span className='toggle-icon'
														onClick={() => setToggle(!toggle)}
													>
														<FontAwesomeIcon icon={toggle ? faEye : faEyeSlash} />
													</span>
												</div>

												<div className="forgot-block text-right mt-2">
													<a className="text-muted" href="forgot-password.html">
														Forgot password?
													</a>
												</div>
											</div>
											<div className="input-block mb-4 text-center">
												<button
													className={` account-btn ${isLoading ? 'disable-btn' : ''}`}
													type="submit"
													disabled={isLoading}
												>
													{isLoading ? <DotLoader /> : "Login"}
												</button>
											</div>
											<div className="account-footer">
												<p>Don't have an account yet? <Link to="/register">Register</Link></p>
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

export default LoginPage;
