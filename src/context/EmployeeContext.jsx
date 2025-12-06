import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const EmployeeContext = createContext();

const EmployeeContextProvider = (props) => {
  const api_url = import.meta.env.VITE_API_URL;

  const [leavesData, setLeavesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [leaveTypeData, setLeaveTypeData] = useState([]);
  const [remainingLeave, setRemainingLeave] = useState([]);

  const [holidayTypeData, setHolidayTypeData] = useState([]);

  const [postsData, setPostsData] = useState([]);

  // -----------------DashBoard page ------------------

  const getPostData = async (token) => {
    console.log("call");

    try {
      const res = await axios.get(`${api_url}/all-post`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          t: Date.now(), // prevent caching
        },
      });

      if (res.data.flag === 1 && res.status === 200) {
        console.log(res.data.data.posts);
        setPostsData(res.data.data.posts);
      } else {
        toast.error(res.data.message || "Failed to fetch posts");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      toast.error(errorMsg);
      console.error("Post Fetch Error:", err);
    }
  };

  const handleAddComment = async (token, postId, commentText) => {
    try {
      const res = await axios.post(
        `${api_url}/post-comment`,
        {
          post_id: postId,
          comment_text: commentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.flag === 1 && res.status === 200) {
        toast.success(res.data.message || "Comment added");
        // Refresh posts after comment
        // getPostData(token);
      } else {
        toast.error(res.data.message || "Failed to add comment");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg);
      console.error("Add Comment Error:", errorMsg);
    }
  };

  // --------------Leaves Page --------------------------

  const fetchReamingLeave = async (token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      };

      const response = await axios.get(
        "https://skilledworkerscloud.co.uk/hrms-v2/api/v1/leave-balance",
        config,
        {
          params: {
            t: Date.now(), // prevent caching
          },
        }
      );
      if (response.data.flag === 1 && response.data.status === 200) {
        setRemainingLeave(response.data.data);
        console.log(response.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      toast.error(errorMsg);
      console.error("API Error:", err.response?.data || err.message);
      return [];
    }
  };

  const fetchLeavesData = async (token, fromDate = null, toDate = null) => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: {},
      };

      // Format dates if provided
      if (fromDate) config.params.from_date = formatDate(fromDate);
      if (toDate) config.params.to_date = formatDate(toDate);

      const response = await axios.post(
        "https://skilledworkerscloud.co.uk/hrms-v2/api/v1/leave",
        {}, // empty request body (or your actual payload if needed)
        config // config goes here as third parameter
      );

      setLeavesData(response.data.data || []);
      console.log("leaves data: ", response.data);

      return response.data.data || [];
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      toast.error(errorMsg);
      console.error("API Error:", err.response?.data || err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };
  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
  };

  // Helper function to format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };
  // Helper function to get status object
  const getStatusObject = (status) => {
    switch (status) {
      case "APPROVED":
        return { text: "Approved", color: "text-success" };
      case "NOT APPROVED":
        return { text: "Pending", color: "text-warning" };
      case "REJECTED":
        return { text: "Declined", color: "text-danger" };
      default:
        return { text: status || "Pending", color: "text-purple" };
    }
  };

  const fetchLeaveTypeData = async (token, emp_id, emid) => {
    // setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: {
          emp_id: emp_id,
          emid: emid,
        },
      };

      const response = await axios.get(
        "https://skilledworkerscloud.co.uk/hrms-v2/api/v1/leave-type",
        config, {
          params: {
          t: Date.now(), // prevent caching
        },
        }
      );
      // console.log(response.data.data);
      if (response.data.flag === 1 && response.data.status === 200) {
        setLeaveTypeData(response.data.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      toast.error(errorMsg);
      console.error("API Error:", err.response?.data || err.message);
    } finally {
      // setLoading(false);
    }
  };

  const fetchLeaveInHandData = async (token, leave_type_id) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: {
          leave_type_id: leave_type_id,
        },
      };

      const response = await axios.post(
        "https://skilledworkerscloud.co.uk/hrms-v2/api/v1/leave-in-hand",
        { leave_type_id }, // Request body (data payload)
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      // console.log(response.data);
      if (response.data.flag === 1 && response.data.status === 200) {
        return response.data.data.leave_in_hand;
      } else {
        return "";
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      toast.error(errorMsg);
      console.error("API Error:", err.response?.data || err.message);
    }
  };

  const calculateDays = (fromDate, toDate) => {
    if (!fromDate || !toDate) return 0;

    const start = new Date(fromDate);
    const end = new Date(toDate);

    // Calculate difference in milliseconds
    const diffTime = end - start;

    // Convert to days (add 1 to include both start and end dates)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays > 0 ? diffDays : 0;
  };

  const leaveApply = async (token, formData) => {
    try {
      // Create FormData object to handle file upload
      const data = new FormData();

      // Append all form fields
      data.append("date_of_apply", formData.date_of_application);
      data.append("leave_type", formData.leave_type_id);
      data.append("from_date", formData.from_date);
      data.append("to_date", formData.to_date);
      // data.append('no_of_days', formData.no_of_days);
      // data.append('leave_cos', formData.reason);

      // Append image if exists
      if (formData.image) {
        data.append("doc_image", formData.image);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await axios.post(
        "https://skilledworkerscloud.co.uk/hrms-v2/api/v1/leave-apply",
        data,
        config
      );
      return response.data.message;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      toast.error(errorMsg);
      console.error("Leave Apply Error:", err.response?.data || err.message);
      throw err;
    }
  };

  // ----------------Holiday Page -------------------------

  const fetchHolidayTypeData = async (token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      };

      const response = await axios.get(
        "https://skilledworkerscloud.co.uk/hrms-v2/api/v1/holiday-type",
        config, {
          params: {
          t: Date.now(), // prevent caching
        },
        }
      );
      console.log(response.data.data);
      if (response.data.flag === 1 && response.data.status === 200) {
        setHolidayTypeData(response.data.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      toast.error(errorMsg);
      console.error("API Error:", err.response?.data || err.message);
    }
  };

  const holidayApply = async (token, formData) => {
    try {
      const response = await axios.post(
        "https://skilledworkerscloud.co.uk/hrms-v2/api/v1/holiday-apply",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);

      return response.data;
    } catch (error) {
      console.error("Error applying for holiday:", error);
      throw (
        error.response?.data?.message ||
        error.message ||
        "Failed to apply for holiday"
      );
    }
  };

  // ------------- Employee Attendance -----------------

  const value = {
    postsData,
    getPostData,
    handleAddComment,
    leavesData,
    loading,
    fetchLeavesData,
    formatDisplayDate,
    getStatusObject,
    fetchLeaveTypeData,
    leaveTypeData,
    fetchLeaveInHandData,
    calculateDays,
    leaveApply,
    fetchReamingLeave,
    remainingLeave,

    fetchHolidayTypeData,
    holidayTypeData,
    holidayApply,
  };

  return (
    <EmployeeContext.Provider value={value}>
      {props.children}
    </EmployeeContext.Provider>
  );
};

export default EmployeeContextProvider;
