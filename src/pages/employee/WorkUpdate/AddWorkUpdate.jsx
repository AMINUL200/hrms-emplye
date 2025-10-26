import { faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useEffect, useState } from 'react'
import Breadcrumb from '../../../component/common/Breadcrumb'
import { AuthContext } from '../../../context/AuthContex'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import CustomTextEditor from '../../../component/common/CustomTextEditor'

const AddWorkUpdate = () => {
    const api_url = import.meta.env.VITE_API_URL;
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [searchParams] = useSearchParams();
    const updatedId = searchParams.get('update');
    const isUpdateMode = Boolean(updatedId);
    
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        fromTime: '',
        toTime: '',
        hours: '',
        minutes: '',
        remarks: '',
        file: null
    });
    
    const [loading, setLoading] = useState(false);
    const [existingFile, setExistingFile] = useState(null); // Track existing file

    const fetchWorkUpdatesData = async (id) => {
        try {
            const response = await axios.get(`${api_url}/work-edit/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })

            if(response.data.flag === 1){
                const workUpdateData = response.data.data;
                
                // Convert time format from "04:44 PM" to "16:44" for input[type="time"]
                const convertTo24Hour = (time12h) => {
                    if (!time12h || time12h === '12:00 AM') return '';
                    
                    try {
                        const [time, modifier] = time12h.split(' ');
                        let [hours, minutes] = time.split(':');
                        
                        // Convert hours to number first, then back to string
                        let hoursNum = parseInt(hours, 10);
                        
                        if (hoursNum === 12) {
                            hoursNum = 0;
                        }
                        
                        if (modifier === 'PM' && hoursNum !== 0) {
                            hoursNum = hoursNum + 12;
                        } else if (modifier === 'PM' && hoursNum === 0) {
                            hoursNum = 12;
                        }
                        
                        // Ensure both hours and minutes are strings and padded
                        const hoursStr = hoursNum.toString().padStart(2, '0');
                        const minutesStr = minutes.toString().padStart(2, '0');
                        
                        return `${hoursStr}:${minutesStr}`;
                    } catch (error) {
                        console.error('Error converting time:', time12h, error);
                        return '';
                    }
                };
                
                setFormData({
                    date: workUpdateData.date || new Date().toISOString().split('T')[0],
                    fromTime: convertTo24Hour(workUpdateData.in_time) || '',
                    toTime: convertTo24Hour(workUpdateData.out_time) || '',
                    hours: workUpdateData.w_hours || '',
                    minutes: workUpdateData.w_min || '',
                    remarks: workUpdateData.remarks || '',
                    file: null // File is not pre-filled for security reasons
                });

                // Set existing file info
                if (workUpdateData.file) {
                    setExistingFile(workUpdateData.file);
                }
            }

        } catch (error) {
            console.log('Error fetching work update data:', error);
            toast.error(error.response?.data?.message || error.message)
        }
    }

    useEffect(() => {
        if (isUpdateMode && updatedId) {
            const fetchData = async () => {
                await fetchWorkUpdatesData(updatedId);
            };
            fetchData();
        }
    }, [isUpdateMode, updatedId]);

    const handleInputChange = (e) => {
        const { id, value, files } = e.target;
        
        if (id === 'file') {
            setFormData(prev => ({ ...prev, file: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const calculateTimeDifference = () => {
        if (formData.fromTime && formData.toTime) {
            const from = new Date(`2000-01-01T${formData.fromTime}`);
            const to = new Date(`2000-01-01T${formData.toTime}`);
            
            // Swap if toTime is earlier than fromTime (overnight work)
            if (to < from) {
                to.setDate(to.getDate() + 1);
            }
            
            const diffMs = to - from;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            
            setFormData(prev => ({
                ...prev,
                hours: diffHours.toString(),
                minutes: diffMinutes.toString()
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const submitData = new FormData();
            
            // Ensure all fields have valid values, not empty strings
            submitData.append('date', formData.date || new Date().toISOString().split('T')[0]);
            submitData.append('in_time', formData.fromTime || '00:00');
            submitData.append('out_time', formData.toTime || '00:00');
            submitData.append('w_hours', formData.hours || '0');
            submitData.append('w_min', formData.minutes || '0');
            submitData.append('remarks', formData.remarks || '');
            
            // Only append file if a new file is selected
            if (formData.file) {
                submitData.append('file', formData.file);
            }

            // Debug: Log the form data
            console.log('Form data being sent:');
            for (let [key, value] of submitData.entries()) {
                console.log(key, value);
            }
            
            let response;
            
            if (isUpdateMode) {
                // Use POST with _method override for Laravel
                submitData.append('_method', 'PUT');
                response = await axios.post(`${api_url}/work-update/${updatedId}`, submitData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                response = await axios.post(`${api_url}/work-update`, submitData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            
            if (response.data.flag === 1) {
                toast.success(response.data.message);
                navigate('/organization/work-update');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error submitting work update:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to submit work update');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='add-work-update mt-4'>
            <Breadcrumb pageTitle={isUpdateMode ? "Edit Work Update" : "Add Work Update"} />
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">
                                <FontAwesomeIcon icon={faUser} />
                                {isUpdateMode ? "Edit Daily Work Update" : "Add Daily Work Update"}
                            </h4>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-12 col-lg-12">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="date">Date:</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        id="date"
                                                        value={formData.date}
                                                        onChange={handleInputChange}
                                                        required />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="fromTime">From Time</label>
                                                    <input 
                                                        type="time" 
                                                        className="form-control" 
                                                        id="fromTime" 
                                                        value={formData.fromTime}
                                                        onChange={handleInputChange}
                                                        onBlur={calculateTimeDifference}
                                                        required />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="toTime"> To Time </label>
                                                    <input 
                                                        type="time" 
                                                        className="form-control" 
                                                        id="toTime" 
                                                        value={formData.toTime}
                                                        onChange={handleInputChange}
                                                        onBlur={calculateTimeDifference}
                                                        required />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="hours">Time (Hours)</label>
                                                    <input 
                                                        type="number" 
                                                        className="form-control" 
                                                        id="hours" 
                                                        value={formData.hours}
                                                        onChange={handleInputChange}
                                                        min="0"
                                                        required />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="minutes">Time (Minutes)</label>
                                                    <input 
                                                        type="number" 
                                                        className="form-control" 
                                                        id="minutes" 
                                                        value={formData.minutes}
                                                        onChange={handleInputChange}
                                                        min="0"
                                                        max="59"
                                                        required />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="file">Upload file</label>
                                                    <input 
                                                        type="file" 
                                                        className="form-control" 
                                                        id="file" 
                                                        onChange={handleInputChange}
                                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                                                    {isUpdateMode && existingFile && (
                                                        <small className="text-muted mt-1 d-block">
                                                            Current file: {existingFile.split('/').pop()}
                                                            <br />
                                                            <a 
                                                                href={`${api_url}/storage/${existingFile}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-primary"
                                                            >
                                                                View Current File
                                                            </a>
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label htmlFor="remarks">Work Update</label>
                                                    {/* <textarea 
                                                        className="form-control" 
                                                        id="remarks" 
                                                        rows='4'
                                                        value={formData.remarks}
                                                        onChange={handleInputChange}
                                                        required
                                                    ></textarea> */}
                                                    <CustomTextEditor
                                                        value={formData.remarks}
                                                        onChange={newContent => setFormData(prev => ({ ...prev, remarks: newContent }))}
                                                        height={200}
                                                        placeholder="Enter work update details here..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-12 text-start">
                                                <button 
                                                    className='btn btn-warning text-white me-2' 
                                                    type="submit"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Submitting...' : (isUpdateMode ? 'Update' : 'Submit')}
                                                </button>
                                                <button 
                                                    type="button"
                                                    className='btn btn-secondary' 
                                                    onClick={() => navigate('/organization/work-update')}
                                                    disabled={loading}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddWorkUpdate;