import React, { useContext, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faCircleArrowRight, faArrowLeft, faChevronLeft, faProjectDiagram, faChevronRight, faClock, faUser, faArrowRight, faListCheck, faFileSignature, faFingerprint, faPlus, faCloudUploadAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Dashboard.css'
import { useTranslation } from 'react-i18next';
import Post from '../../../component/posts/Post';
import NotificationCard from '../../../component/notification/NotificationCard ';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContex';
import { toast } from 'react-toastify';
import PageLoader from '../../../component/loader/PageLoader';
import { EmployeeContext } from '../../../context/EmployeeContext';

const Dashboard = () => {
  const { t } = useTranslation();
  const api_url = import.meta.env.VITE_API_URL;
  const { token } = useContext(AuthContext);
  const { postsData, getPostData } = useContext(EmployeeContext);


  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const dashboardCards = [
    {
      title: "Profile",
      link: "/organization/employerprofile",
      icon: faUser,
    },
    {
      title: "Holiday Calendar",
      link: "/organization/holiday",
      icon: faCalendarDays,
    },
    {
      title: "Daily Work Update",
      link: "/organization/work-update",
      icon: faListCheck,
    },
    {
      title: "Leave Apply",
      link: "/organization/leaves",
      icon: faFileSignature,
    },
    {
      title: "Attendance Status",
      link: "/organization/attendance-status",
      icon: faFingerprint,
    },
    {
      title: "Assigned Project",
      link: "/organization/assigned-project",
      icon: faProjectDiagram,
    },
  ];
  const [showModal, setShowModal] = useState(false);
  const [formDataState, setFormDataState] = useState({
    content: '',
    post_file: null,
  });
  const [preview, setPreview] = useState(null);
  const [createPostLoading, setCreatePostLoading] = useState(false);
  const [Loading, setLoading] = useState(true)









  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDataState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    // Validate file type and size
    if (file) {
      const validTypes = ['image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error('Only JPG/PNG images are allowed');
        return;
      }

      if (file.size > maxSize) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setFormDataState((prev) => ({
        ...prev,
        post_file: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreatePostLoading(true)

    const formData = new FormData();
    formData.append("content", formDataState.content);
    formData.append("post_file", formDataState.post_file);

    try {
      const res = await axios.post(`${api_url}/emp-post`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type' is automatically set to 'multipart/form-data'
        },
      });

      // console.log(res);
      if (res.status === 200 && res.data.flag === 1) {
        toast.success(res.data.message)
      } else {
        toast.error(res.data.message)
      }


    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      // Reset
      setFormDataState({ content: '', post_file: null });
      setPreview(null);
      setShowModal(false);
      setCreatePostLoading(false);
      getPostData(token)
    }
  };


  // Listen for window resize and update windowWidth
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (token) {
      getPostData(token).finally(() => {
        setLoading(false);
      });
    }
  }, [token]);


  // if(postsData){
  //   console.log(postsData);
  // }




  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    cssEase: "ease-in-out",
    slidesToScroll: 1,
    slidesToShow:
      windowWidth >= 1200
        ? 4
        : windowWidth >= 992
          ? 3
          : windowWidth >= 768
            ? 2
            : 1,
  };

  const companySettings = {
    dots: false,
    infinite: true,
    speed: 1000,
    cssEase: "ease-in-out",
    slidesToShow: windowWidth >= 768 ? 2 : 1,
    slidesToScroll: 1,
  }

  if (Loading) {
    return <PageLoader />
  }

  return (
    <div className="content dashboard-container">

      <div className="row">
        {dashboardCards.map((card, index) => (
          <div key={index} className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
            <div className="card dash-widget overflow-visible">
              <Link to={card.link}>
                <div className="card-body modern-card">
                  <div className="dash-widget-info">
                    <span>{card.title}</span>
                  </div>
                  <div className="modern_icon_wrapper">
                    <FontAwesomeIcon className='modern-icon' icon={card.icon} />
                  </div>
                  <div className="modern-arrow pt-2">
                    <span>View</span>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>



      <div className="row section-padding ">
        <div className="col-xxl-6 col-lg-12 col-md-12">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              {/* Holiday */}
              <div className="card info-card flex-fill" >
                <div className="card-body">
                  <h4>{t('dashboard.upcomingHolidays')}</h4>
                  <div className="holiday-details">
                    <div className="holiday-calendar">
                      <div className="holiday-calendar-icon">
                        <FontAwesomeIcon icon={faCalendarDays} size="lg" color="#fff" />

                      </div>
                      <div className="holiday-calendar-content">
                        <h6>Ramzan</h6>
                        <p>Mon 20 May 2024</p>
                      </div>
                    </div>
                    <div className="holiday-btn">
                      <Link to="/organization/holiday" className="btn">View All</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12 col-md-12   " >
              <div className='pb-4 bg-grays'>
                <NotificationCard />

              </div>
            </div>

          </div>
        </div>
        {/* posts */}
        <div className="col-xxl-6 col-lg-12 col-md-12 pb-4  bg-grays"
          style={{ paddingLeft: '0', paddingRight: '0' }}
        >
          <div className="d-flex justify-content-between align-items-center post-h mb-2">
            <h3 className="m-0">Latest Posts</h3>
            <button className="btn btn-outline d-flex align-items-center gap-2 shadow-sm custom-add-post-btn "
              onClick={() => setShowModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Post
            </button>

          </div>
          <div className="overflow-auto custom-scrollbar pb-4" style={{ maxHeight: '550px', paddingTop: '10px' }}>
            <Post posts={postsData} />
          </div>

        </div>
      </div>

      <div className="row section-padding">
        <div className="col-lg-12 col-md-12" >
          <div className="card flex-fill">
            <div className="card-body">
              <div className="statistic-header">
                <h4>{t('dashboard.statistics')}</h4>
                <div className="dropdown statistic-dropdown">
                  <a className="dropdown-toggle" data-bs-toggle="dropdown" href="javascript:void(0);">
                    {t('dashboard.timePeriods.today')}
                  </a>
                  <div className="dropdown-menu dropdown-menu-end">
                    <a href="javascript:void(0);" className="dropdown-item">
                      {t('dashboard.timePeriods.week')}
                    </a>
                    <a href="javascript:void(0);" className="dropdown-item">
                      {t('dashboard.timePeriods.month')}
                    </a>
                    <a href="javascript:void(0);" className="dropdown-item">
                      {t('dashboard.timePeriods.year')}
                    </a>
                  </div>
                </div>
              </div>
              <div className="clock-in-info">
                <div className="clock-in-content">
                  <p>{t('dashboard.workTime')}</p>
                  <h4>6 Hrs : 54 Min</h4>
                </div>
                <div className="clock-in-btn">
                  <a href="javascript:void(0);" className="btn btn-primary">
                    <FontAwesomeIcon icon={faClock} />  &nbsp; {t('dashboard.clockIn')}
                  </a>

                </div>
              </div>
              <div className="clock-in-list">
                <ul className="nav">
                  <li>
                    <p>{t('dashboard.remaining')}</p>
                    <h6>2 Hrs 36 Min</h6>
                  </li>
                  <li>
                    <p>{t('dashboard.overtime')}</p>
                    <h6>0 Hrs 00 Min</h6>
                  </li>
                  <li>
                    <p>{t('dashboard.break')}</p>
                    <h6>1 Hrs 20 Min</h6>
                  </li>
                </ul>
              </div>
              <div className="view-attendance">
                <Link to="/organization/attendance-status">
                  {t('dashboard.viewAttendance')}<FontAwesomeIcon className='right-arr' icon={faCircleArrowRight} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>






      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Create New Post</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">Content</label>
                    <input
                      type="text"
                      className="form-control"
                      name="content"
                      value={formDataState.content}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="post_file" className="form-label d-block">
                      {preview ? (
                        <div className="position-relative d-inline-block"
                          style={{
                            margin: '0 100px'
                          }}
                        >
                          <img
                            src={preview}
                            alt="Preview"
                            className="img-thumbnail rounded"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              cursor: 'pointer'
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-icon btn-danger position-absolute top-0 end-0 translate-middle"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormDataState(prev => ({ ...prev, post_file: null }));
                              setPreview(null);
                              document.getElementById('post_file').value = '';
                            }}
                            style={{ height: '24px' }}
                          >
                            <FontAwesomeIcon icon={faTimes} size="xs" />
                          </button>
                        </div>
                      ) : (
                        <div className="upload-placeholder d-flex flex-column align-items-center justify-content-center">
                          <div className="upload-icon-circle mb-2">
                            <FontAwesomeIcon icon={faCloudUploadAlt} />
                          </div>
                          <span className="text-muted">Click to upload image</span>
                          <small className="text-muted">(JPG, PNG - Max 5MB)</small>
                        </div>
                      )}
                      <input
                        type="file"
                        className="d-none"
                        id="post_file"
                        name="post_file"
                        accept="image/jpeg,image/png"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={createPostLoading}
                    onClick={() => {
                      setShowModal(false)
                      setFormDataState({ content: '', post_file: null });
                      setPreview(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={createPostLoading}
                  >
                    {createPostLoading && (
                      <svg
                        className="spinner-border spinner-border-sm text-light"
                        role="status"
                        style={{ width: "1rem", height: "1rem" }}
                      >
                        <span className="visually-hidden">Loading...</span>
                      </svg>
                    )}
                    Post
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}




    </div>
  )
}

export default Dashboard
