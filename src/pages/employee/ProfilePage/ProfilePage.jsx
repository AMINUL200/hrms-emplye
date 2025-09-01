import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ProfileImg } from '../../../assets';
import { faEllipsisV, faPencil, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../../../component/common/Breadcrumb';
import './ProfilePage.css';
import { AuthContext } from '../../../context/AuthContex';
import axios from 'axios';
import { toast } from 'react-toastify';
import PageLoader from '../../../component/loader/PageLoader';

const ProfilePage = () => {
	const navigate = useNavigate();
	const api_url = import.meta.env.VITE_API_URL;
	const storage_url = import.meta.env.VITE_STORAGE_URL;
	const { token } = useContext(AuthContext);
	const [loading, setLoading] = useState(true);
	const [isEdit, setIsEdit] = useState(false);
	const [profileData, setProfileData] = useState(null);
	const [imageUploading, setImageUploading] = useState(false);

	const fetchProfileData = async () => {
		try {
			const response = await axios.get(`${api_url}/employee`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (response.data.flag !== 1) {
				toast.error(response.data.message || "Failed to fetch profile data");
				if (response.data.flag === 0) {
					navigate('/organization/employerdashboard');
				}
				return;
			} else {
				setProfileData(response.data.data[0]);
			}
		} catch (error) {
			console.error("Error fetching profile data:", error);
			toast.error(error?.response?.data?.message || "Failed to fetch profile data");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProfileData();
	}, []);

	// Helper function to format date
	const formatDate = (dateString) => {
		if (!dateString || dateString === '1970-01-01') return 'Not provided';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	};

	// Helper function to format employee name
	const getFullName = () => {
		if (!profileData) return 'Loading...';
		const { emp_fname, emp_mname, emp_lname } = profileData;
		return [emp_fname, emp_mname, emp_lname].filter(Boolean).join(' ');
	};

	// Helper function to get profile image
	const getProfileImage = () => {
		if (profileData?.emp_image) {
			return `${storage_url}/${profileData.emp_image}`;
		}
		return ProfileImg;
	};

	if (loading) {
		return <PageLoader/>
	}

	if (!profileData) {
		return (
			<div className='content profile'>
				<Breadcrumb pageTitle="Profile" />
				<div className="card mb-0">
					<div className="card-body">
						<div className="text-center p-4">
							<p>No profile data available</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='content profile'>
			<Breadcrumb pageTitle="Profile" />

			<div className="card mb-0">
				<div className="card-body">
					<div className="row">
						<div className="col-md-12">
							<div className="profile-view">
								<div className="profile-img-wrap">
									<div className="profile-img">
										<a href="#"><img src={getProfileImage()} alt="User Image" /></a>
									</div>
								</div>
								<div className="profile-basic">
									<div className="row">
										<div className="col-md-5">
											<div className="profile-info-left">
												<h3 className="user-name m-t-0 mb-0">{getFullName()}</h3>
												<h6 className="text-muted">{profileData.emp_department || 'Department not specified'}</h6>
												<small className="text-muted">{profileData.emp_designation || 'Designation not specified'}</small>
												<div className="staff-id">Employee ID : {profileData.emp_code || profileData.emid}</div>
												<div className="small doj text-muted">Date of Join : {formatDate(profileData.emp_doj)}</div>

												<div className="staff-msg">
													{!isEdit ?
														<button className="btn btn-custom" onClick={() => setIsEdit(true)} >Edit Profile</button> :
														<>
															<button className="btn cancel-btn" onClick={() => setIsEdit(false)} >Cancel </button>
															<button className="btn btn-custom" >Update </button>
														</>
													}
												</div>
											</div>
										</div>
										<div className="col-md-7">
											<ul className="personal-info">
												<li>
													<div className="title">Phone:</div>
													<div className="text"><a href={`tel:${profileData.em_contact}`}>{profileData.em_contact || 'Not provided'}</a></div>
												</li>
												<li>
													<div className="title">Email:</div>
													<div className="text"><a href={`mailto:${profileData.emp_ps_email}`}>{profileData.emp_ps_email || 'Not provided'}</a></div>
												</li>
												<li>
													<div className="title">Birthday:</div>
													<div className="text">{formatDate(profileData.emp_dob)}</div>
												</li>
												<li>
													<div className="title">Address:</div>
													<div className="text">
														{[
															profileData.emp_pr_street_no,
															profileData.emp_per_village,
															profileData.emp_pr_city,
															profileData.emp_pr_state,
															profileData.emp_pr_country,
															profileData.emp_pr_pincode
														].filter(Boolean).join(', ') || 'Not provided'}
													</div>
												</li>
												<li>
													<div className="title">Gender:</div>
													<div className="text">{profileData.emp_gender || 'Not specified'}</div>
												</li>
												<li>
													<div className="title">Reports to:</div>
													<div className="text">
														<div className="avatar-box">
															<div className="avatar avatar-xs">
																<img src="assets/img/profiles/avatar-16.jpg" alt="User Image" />
															</div>
														</div>
														<a href="profile.html">
															{profileData.emp_reporting_auth || 'Not assigned'}
														</a>
													</div>
												</li>
											</ul>
										</div>
									</div>
								</div>
								<div className="pro-edit"><a data-bs-target="#profile_info" data-bs-toggle="modal" className="edit-icon" href="#"><i className="fa-solid fa-pencil"></i></a></div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="card tab-box">
				<div className="row user-tabs">
					<div className="col-lg-12 col-md-12 col-sm-12 line-tabs">
						<ul className="nav nav-tabs nav-tabs-bottom">
							<li className="nav-item"><a href="#emp_profile" data-bs-toggle="tab" className="nav-link active">Profile</a></li>
						</ul>
					</div>
				</div>
			</div>

			<div className="tab-content">
				<div id="emp_profile" className="pro-overview tab-pane fade show active">
					<div className="row">
						<div className="col-md-6 d-flex">
							<div className="card profile-box flex-fill">
								<div className="card-body">
									<h3 className="card-title">Personal Informations <a href="#" className="edit-icon" data-bs-toggle="modal" data-bs-target="#personal_info_modal"><i className="fa-solid fa-pencil"></i></a></h3>
									<ul className="personal-info">
										<li>
											<div className="title">Passport No.</div>
											<div className="text">{profileData.pass_doc_no || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Passport Exp Date.</div>
											<div className="text">{formatDate(profileData.pass_exp_date)}</div>
										</li>
										<li>
											<div className="title">Tel</div>
											<div className="text">{profileData.emp_ps_phone || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Nationality</div>
											<div className="text">{profileData.nationality || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Religion</div>
											<div className="text">{profileData.emp_religion || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Marital status</div>
											<div className="text">{profileData.marital_status || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Employment of spouse</div>
											<div className="text">{profileData.emp_spouse_working_status || 'N/A'}</div>
										</li>
										<li>
											<div className="title">Spouse Name</div>
											<div className="text">{profileData.spouse_name || 'N/A'}</div>
										</li>
									</ul>
								</div>
							</div>
						</div>
						<div className="col-md-6 d-flex">
							<div className="card profile-box flex-fill">
								<div className="card-body">
									<h3 className="card-title">Emergency Contact <a href="#" className="edit-icon" data-bs-toggle="modal" data-bs-target="#emergency_contact_modal"><i className="fa-solid fa-pencil"></i></a></h3>
									<h5 className="section-title">Primary</h5>
									<ul className="personal-info">
										<li>
											<div className="title">Name</div>
											<div className="text">{profileData.em_name || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Relationship</div>
											<div className="text">{profileData.em_relation || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Phone </div>
											<div className="text">{profileData.em_phone || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Email</div>
											<div className="text">{profileData.em_email || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Address</div>
											<div className="text">{profileData.em_address || 'Not provided'}</div>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6 d-flex">
							<div className="card profile-box flex-fill">
								<div className="card-body">
									<h3 className="card-title">Bank & Document Information</h3>
									<ul className="personal-info">
										<li>
											<div className="title">Bank name</div>
											<div className="text">{profileData.emp_bank_name || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Bank account No.</div>
											<div className="text">{profileData.emp_account_no || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">PAN No</div>
											<div className="text">{profileData.emp_pan_no || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Aadhar No</div>
											<div className="text">{profileData.emp_aadhar_no || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">National Insurance</div>
											<div className="text">{profileData.ni_no || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Status</div>
											<div className="text">
												<span className={`badge ${profileData.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
													{profileData.status || 'Unknown'}
												</span>
											</div>
										</li>
									</ul>
								</div>
							</div>
						</div>
						<div className="col-md-6 d-flex">
							<div className="card profile-box flex-fill">
								<div className="card-body">
									<h3 className="card-title">Work Information</h3>
									<ul className="personal-info">
										<li>
											<div className="title">Employee Status</div>
											<div className="text">{profileData.emp_status || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Job Location</div>
											<div className="text">{profileData.job_loc || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Start Date</div>
											<div className="text">{formatDate(profileData.start_date)}</div>
										</li>
										<li>
											<div className="title">End Date</div>
											<div className="text">{formatDate(profileData.end_date)}</div>
										</li>
										<li>
											<div className="title">Confirmation Date</div>
											<div className="text">{formatDate(profileData.date_confirm)}</div>
										</li>
										<li>
											<div className="title">Retirement Date</div>
											<div className="text">{formatDate(profileData.emp_retirement_date)}</div>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
					
					{/* Document Information */}
					<div className="row">
						<div className="col-md-6 d-flex">
							<div className="card profile-box flex-fill">
								<div className="card-body">
									<h3 className="card-title">Visa Information</h3>
									<ul className="personal-info">
										<li>
											<div className="title">Visa Document No.</div>
											<div className="text">{profileData.visa_doc_no || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Issue Date</div>
											<div className="text">{formatDate(profileData.visa_issue_date)}</div>
										</li>
										<li>
											<div className="title">Expiry Date</div>
											<div className="text">{formatDate(profileData.visa_exp_date)}</div>
										</li>
										<li>
											<div className="title">Issued By</div>
											<div className="text">{profileData.visa_issue || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Current Status</div>
											<div className="text">
												<span className={`badge ${profileData.visa_cur === 'Yes' ? 'bg-success' : 'bg-warning'}`}>
													{profileData.visa_cur || 'Unknown'}
												</span>
											</div>
										</li>
									</ul>
								</div>
							</div>
						</div>
						<div className="col-md-6 d-flex">
							<div className="card profile-box flex-fill">
								<div className="card-body">
									<h3 className="card-title">Professional License</h3>
									<ul className="personal-info">
										<li>
											<div className="title">License Title</div>
											<div className="text">{profileData.titleof_license || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">License Number</div>
											<div className="text">{profileData.cf_license_number || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Start Date</div>
											<div className="text">{formatDate(profileData.cf_start_date)}</div>
										</li>
										<li>
											<div className="title">End Date</div>
											<div className="text">{formatDate(profileData.cf_end_date)}</div>
										</li>
										<li>
											<div className="title">Verification Status</div>
											<div className="text">
												<span className={`badge ${profileData.verify_status === 'approved' ? 'bg-success' : 'bg-warning'}`}>
													{profileData.verify_status || 'Pending'}
												</span>
											</div>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>

					{/* Additional Document Cards */}
					<div className="row">
						<div className="col-md-6 d-flex">
							<div className="card profile-box flex-fill">
								<div className="card-body">
									<h3 className="card-title">DBS Information</h3>
									<ul className="personal-info">
										<li>
											<div className="title">DBS Reference No.</div>
											<div className="text">{profileData.dbs_ref_no || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">DBS Type</div>
											<div className="text">{profileData.dbs_type || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Issue Date</div>
											<div className="text">{formatDate(profileData.dbs_issue_date)}</div>
										</li>
										<li>
											<div className="title">Expiry Date</div>
											<div className="text">{formatDate(profileData.dbs_exp_date)}</div>
										</li>
										<li>
											<div className="title">Current Status</div>
											<div className="text">
												<span className={`badge ${profileData.dbs_cur === 'Yes' ? 'bg-success' : 'bg-warning'}`}>
													{profileData.dbs_cur || 'Unknown'}
												</span>
											</div>
										</li>
									</ul>
								</div>
							</div>
						</div>
						<div className="col-md-6 d-flex">
							<div className="card profile-box flex-fill">
								<div className="card-body">
									<h3 className="card-title">EUSS Information</h3>
									<ul className="personal-info">
										<li>
											<div className="title">EUSS Reference No.</div>
											<div className="text">{profileData.euss_ref_no || 'Not provided'}</div>
										</li>
										<li>
											<div className="title">Issue Date</div>
											<div className="text">{formatDate(profileData.euss_issue_date)}</div>
										</li>
										<li>
											<div className="title">Expiry Date</div>
											<div className="text">{formatDate(profileData.euss_exp_date)}</div>
										</li>
										<li>
											<div className="title">Review Date</div>
											<div className="text">{formatDate(profileData.euss_review_date)}</div>
										</li>
										<li>
											<div className="title">Current Status</div>
											<div className="text">
												<span className={`badge ${profileData.euss_cur === 'Yes' ? 'bg-success' : 'bg-warning'}`}>
													{profileData.euss_cur || 'Unknown'}
												</span>
											</div>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>

					{/* Family Information - Updated to handle nominees */}
					<div className="row">
						<div className="col-md-12 d-flex">
							<div className="card profile-box flex-fill">
								<div className="card-body">
									<h3 className="card-title">Nominee Informations <a href="#" className="edit-icon" data-bs-toggle="modal" data-bs-target="#family_info_modal"><i className="fa-solid fa-pencil"></i></a></h3>
									<div className="table-responsive">
										<table className="table table-nowrap">
											<thead>
												<tr>
													<th>Name</th>
													<th>Relationship</th>
													<th>Date of Birth</th>
													<th>Share %</th>
													<th></th>
												</tr>
											</thead>
											<tbody>
												{profileData.nominee_name_one && (
													<tr>
														<td>{profileData.nominee_name_one}</td>
														<td>{profileData.nominee_relationship_one || 'Not specified'}</td>
														<td>{formatDate(profileData.nominee_dob_one)}</td>
														<td>{profileData.emp_nomination_share_one || 'Not specified'}%</td>
														<td className="text-end">
															<div className="dropdown dropdown-action">
																<a aria-expanded="false" data-bs-toggle="dropdown" className="action-icon dropdown-toggle" href="#"><FontAwesomeIcon className='faEllipsisV-icon' icon={faEllipsisV} /></a>
																<div className="dropdown-menu dropdown-menu-right">
																	<a href="#" className="dropdown-item"><FontAwesomeIcon icon={faPencil} /> &nbsp; Edit</a>
																	<a href="#" className="dropdown-item"><FontAwesomeIcon icon={faTrashCan} /> &nbsp; Delete</a>
																</div>
															</div>
														</td>
													</tr>
												)}
												{profileData.nominee_name_two && (
													<tr>
														<td>{profileData.nominee_name_two}</td>
														<td>{profileData.nominee_relationship_two || 'Not specified'}</td>
														<td>{formatDate(profileData.nominee_dob_two)}</td>
														<td>{profileData.emp_nomination_share_two || 'Not specified'}%</td>
														<td className="text-end">
															<div className="dropdown dropdown-action">
																<a aria-expanded="false" data-bs-toggle="dropdown" className="action-icon dropdown-toggle" href="#"><FontAwesomeIcon className='faEllipsisV-icon' icon={faEllipsisV} /></a>
																<div className="dropdown-menu dropdown-menu-right">
																	<a href="#" className="dropdown-item"><FontAwesomeIcon icon={faPencil} /> &nbsp; Edit</a>
																	<a href="#" className="dropdown-item"><FontAwesomeIcon icon={faTrashCan} /> &nbsp; Delete</a>
																</div>
															</div>
														</td>
													</tr>
												)}
												{!profileData.nominee_name_one && !profileData.nominee_name_two && (
													<tr>
														<td colSpan="5" className="text-center text-muted">No nominee information available</td>
													</tr>
												)}
											</tbody>
										</table>
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

export default ProfilePage;