import React, { useContext } from "react";
import GuestProfile from "./GuestProfile";
import ProfilePage from "./ProfilePage";
import { AuthContext } from "../../../context/AuthContex";

const ProfileRouter = () => {
  const { data } = useContext(AuthContext);

  if (data?.user_type === "guest") {
    return <GuestProfile />;
  }

  return <ProfilePage />;
};

export default ProfileRouter;
