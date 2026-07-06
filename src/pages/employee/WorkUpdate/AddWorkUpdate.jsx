import { faClipboardList, faCalendarAlt, faClock, faPaperPlane, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useEffect, useState } from 'react'
import Breadcrumb from '../../../component/common/Breadcrumb'
import { AuthContext } from '../../../context/AuthContex'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import CustomTextEditor from '../../../component/common/CustomTextEditor'
import './AddWorkUpdate.css'

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
    const [fileName, setFileName] = useState('');

    const fetchWorkUpdatesData = async (id) => {
        try {
            const response = await axios.get(`${api_url}/work-edit/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    t: Date.now(), // prevent caching
                },
            })

            if (response.data.flag === 1) {
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
            setFileName(files[0] ? files[0].name : '');
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    // Auto-calculate total time whenever From Time / To Time changes
    useEffect(() => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.fromTime, formData.toTime]);

    const totalTimeLabel = (formData.hours || formData.minutes)
        ? `${formData.hours || 0}h ${formData.minutes || 0}m`
        : '';

    // Plain-text character count for the rich text remarks field
    const remarksCharCount = formData.remarks
        ? formData.remarks.replace(/<[^>]*>/g, '').length
        : 0;

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
            toast.error(error.response?.data?.message || 'Failed to submit work update');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='add-work-update mt-4'>
            <Breadcrumb pageTitle={isUpdateMode ? "Edit Work Report" : "Add Work Report"} />

            <div className="row">
                <div className="col-md-12">
                    <div className="aw-card">
                        {/* Header */}
                        <div className="aw-card-header">
                            <span className="aw-header-icon">
                                <FontAwesomeIcon icon={faClipboardList} />
                            </span>
                            <h4 className="aw-card-title">
                                {isUpdateMode ? "Edit Work Report" : "Add Work Report"}
                            </h4>
                        </div>

                        <div className="aw-card-body">
                            <form onSubmit={handleSubmit}>
                                {/* Row 1 : Date / From Time / To Time / Total Time */}
                                <div className="row aw-row">
                                    <div className="col-md-3 col-sm-6">
                                        <div className="aw-field">
                                            <label htmlFor="date" className="aw-label">
                                                Date <span className="aw-required">*</span>
                                            </label>
                                            <div className="aw-input-wrap">
                                                <input
                                                    type="date"
                                                    className="form-control aw-input"
                                                    id="date"
                                                    value={formData.date}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                                <FontAwesomeIcon icon={faCalendarAlt} className="aw-input-icon" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-3 col-sm-6">
                                        <div className="aw-field">
                                            <label htmlFor="fromTime" className="aw-label">
                                                From Time <span className="aw-required">*</span>
                                            </label>
                                            <div className="aw-input-wrap">
                                                <input
                                                    type="time"
                                                    className="form-control aw-input"
                                                    id="fromTime"
                                                    value={formData.fromTime}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                                <FontAwesomeIcon icon={faClock} className="aw-input-icon" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-3 col-sm-6">
                                        <div className="aw-field">
                                            <label htmlFor="toTime" className="aw-label">
                                                To Time <span className="aw-required">*</span>
                                            </label>
                                            <div className="aw-input-wrap">
                                                <input
                                                    type="time"
                                                    className="form-control aw-input"
                                                    id="toTime"
                                                    value={formData.toTime}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                                <FontAwesomeIcon icon={faClock} className="aw-input-icon" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-3 col-sm-6">
                                        <div className="aw-field">
                                            <label htmlFor="totalTime" className="aw-label">
                                                Total Time (Hours) <span className="aw-required">*</span>
                                            </label>
                                            <div className="aw-input-wrap">
                                                <input
                                                    type="text"
                                                    className="form-control aw-input aw-input--readonly"
                                                    id="totalTime"
                                                    value={totalTimeLabel}
                                                    placeholder="0h 0m"
                                                    readOnly
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2 : Upload File */}
                                <div className="row aw-row">
                                    <div className="col-md-12">
                                        <div className="aw-field">
                                            <label htmlFor="file" className="aw-label">
                                                Upload File <span className="aw-optional">(Optional)</span>
                                            </label>
                                            <div className="aw-file-box">
                                                <input
                                                    type="file"
                                                    className="aw-file-input"
                                                    id="file"
                                                    onChange={handleInputChange}
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                />
                                            </div>
                                            {isUpdateMode && existingFile && (
                                                <small className="aw-existing-file">
                                                    Current file: {existingFile.split('/').pop()}
                                                    {' '}
                                                    <a
                                                        href={`${api_url}/storage/${existingFile}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="aw-existing-file-link"
                                                    >
                                                        View Current File
                                                    </a>
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 3 : Work Report editor */}
                                <div className="row aw-row">
                                    <div className="col-md-12">
                                        <div className="aw-field">
                                            <label htmlFor="remarks" className="aw-label">
                                                Work Report <span className="aw-required">*</span>
                                            </label>
                                            <div className="aw-editor-wrap">
                                                <CustomTextEditor
                                                    value={formData.remarks}
                                                    onChange={newContent => setFormData(prev => ({ ...prev, remarks: newContent }))}
                                                    height={200}
                                                    placeholder="Enter work update details here..."
                                                />
                                            </div>
                                            <div className="aw-char-count">
                                                Characters: {remarksCharCount}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 4 : Actions */}
                                <div className="row aw-row">
                                    <div className="col-md-12">
                                        <button
                                            className='aw-btn aw-btn--submit'
                                            type="submit"
                                            disabled={loading}
                                        >
                                            <FontAwesomeIcon icon={faPaperPlane} />
                                            {loading ? 'Submitting...' : (isUpdateMode ? 'Update' : 'Submit')}
                                        </button>
                                        <button
                                            type="button"
                                            className='aw-btn aw-btn--cancel'
                                            onClick={() => navigate('/organization/work-update')}
                                            disabled={loading}
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
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
    )
}

export default AddWorkUpdate;