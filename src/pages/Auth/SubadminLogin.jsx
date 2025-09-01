import { faLock, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { useNavigate } from 'react-router-dom';

const SubadminLogin = () => {
     const navigate = useNavigate();


    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/organization/employerdashboard');
    };
    return (
        <div className='main_login_screen_wrapper'>
            <div className="background">
                <div className="shape"></div>
                <div className="shape"></div>
            </div>
            <div className="main_login_page">
                <form onSubmit={handleSubmit}>
                    <h3>Login Here</h3>

                    <div className="row">
                        <div className="col-md-12">
                            <label htmlFor="username">
                                <FontAwesomeIcon icon={faUser} />
                                Username
                            </label>
                            <input type="text" placeholder='Email or Phone' id='username'/>
                        </div>
                        <div className="col-md-12">
                            <label htmlFor="password">
                                <FontAwesomeIcon icon={faLock} />
                                Password
                            </label>
                            <input type="password" name="" id="password" placeholder='password' />
                        </div>
                        <div className="col-md-12">
                            <button type='submit' >Log In</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SubadminLogin
