import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContex';
import { useNavigate } from 'react-router-dom';
import { deFlag, esFlag, frFlag, logo2, usFlag } from '../../assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';



const Navbar = ({ toggleSidebar, isOpen }) => {
    const { logoutUser, data } = useContext(AuthContext);
    const storage_url = import.meta.env.VITE_STORAGE_URL;
    const navigate = useNavigate();

    const { t, i18n } = useTranslation();

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    // Helper function to format employee name
    const getFullName = () => {
        if (!data) return 'Loading...';
        const { emp_fname, emp_mname, emp_lname } = data;
        return [emp_fname, emp_mname, emp_lname].filter(Boolean).join(' ');
    };

    // Helper function to get profile image
    const getProfileImage = () => {
        if (data?.emp_image) {
            return `${storage_url}/${data.emp_image}`;
        }
        return 'https://i.pravatar.cc/40';
    };




    return (
        <div className='header'>
            <div className='header-left'>
                {/* Logo */}
                <div className="header-log">
                    <a href="#" className="logo2">
                        <img src={logo2} width="100" height="90" alt="Logo" />
                    </a>
                </div>

                {/* Toggle Button */}
                {/* <div className={`toggle_btn ${!isOpen ? 'sidebar-open' : 'sidebar-closed'}`} onClick={toggleSidebar}> */}
                <div className={`toggle_btn sidebar-closed`} onClick={toggleSidebar}>
                    <span className="bar-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </div>


            {/* Page Title */}


            {/* Right Side Menu */}
            <div className="hed-right">
                <div className='search-info'>
                    <div className="search" >
                        <input
                            type="text"
                            placeholder={t("search")}
                        />
                        <button
                            type="submit"
                        >
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </div>


                    <div className="dropdown lang-dropdown">
                        <a className="dropdown-toggle" data-bs-toggle="dropdown" >
                            <img
                                src={i18n.language === 'en' ? usFlag : i18n.language === 'fr' ? frFlag : i18n.language === 'es' ? esFlag : deFlag}
                                width={20} alt=""
                            />
                            &nbsp;
                            <span>{i18n.language === 'en' ? 'English' : i18n.language === 'fr' ? 'French' : i18n.language === 'es' ? 'Spanish' : 'German'}</span>
                        </a>
                        <div className="dropdown-menu dropdown-menu-end">
                            <a className="dropdown-toggle" data-bs-toggle="dropdown" style={{ color: 'black' }} onClick={() => changeLanguage('en')}>
                                <img src={usFlag} width={20} alt="" />&nbsp;
                                English
                            </a>
                            <a href="" className="dropdown-item" onClick={() => changeLanguage('fr')}>
                                <img src={frFlag} width={20} alt="" /> &nbsp;
                                French
                            </a>
                            <a href="" className="dropdown-item" onClick={() => changeLanguage('es')}>
                                <img src={esFlag} width={20} alt="" /> &nbsp;
                                Spanish
                            </a>
                            <a href="" className="dropdown-item" onClick={() => changeLanguage('de')}>
                                <img src={deFlag} width={20} alt="" /> &nbsp;
                                German
                            </a>
                        </div>
                    </div>


                </div>
                <div className='header-profile'>
                    <div className="dropdown mobile-user-menu">
                        {/* Entire profile trigger area */}
                        <a
                            href="#"
                            className="nav-link dropdown-toggle d-flex align-items-center"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            {/* Profile Image */}
                            <div className="user-img-wrapper me-2">
                                {/* <img src="https://i.pravatar.cc/40" alt="User" className="user-img" /> */}
                               <img src={getProfileImage()} alt="User Image" className="user-img" />
                            </div>

                            {/* User Name */}
                            <div className="user-name">
                                <span>{getFullName()}</span>

                            </div>

                            {/* Icon */}
                            <div className="icon">
                                <FontAwesomeIcon icon={faEllipsisVertical} />
                            </div>
                        </a>

                        {/* Dropdown Menu */}
                        <div className="dropdown-menu dropdown-menu-right">
                            <a className="dropdown-item" onClick={() => navigate('/profile')}>Profile</a>
                            <a className="dropdown-item" onClick={logoutUser}>Logout</a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Navbar;
