import {
  Avatar,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { db } from "../Database/firebaseConfig"; // Import Firestore
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "react-hot-toast"; // Use for notifications

const SideBar = ({
  profile,
  handleInputChange,
  handleEditToggle,
  handleLogOut,
  editMode,
  user,
  setProfile,
}) => {
  const [profileImage, setProfileImage] = useState(
    "https://via.placeholder.com/150"
  );
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && user.uid) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchProfile();
  }, [user, setProfile]);

  // Update or create user profile in Firestore
  const handleSaveProfile = async () => {
    if (!user || !user.uid) {
      toast.error("User not authenticated.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { ...profile, uid: user.uid }, { merge: true });
      toast.success("Profile updated successfully!");
      handleEditToggle(); // Exit edit mode after saving
    } catch (error) {
      console.error("Error updating or creating profile: ", error);
      toast.error("Failed to update profile.");
    }
  };

  return (
    <Grid item xs={12} md={4}>
      <Card
        sx={{
          padding: 3,
          textAlign: "center",
          boxShadow: 3,
          borderRadius: "20px",
        }}
      >
        <Avatar
          src={profileImage}
          alt="User Avatar"
          sx={{ width: 150, height: 150, margin: "0 auto" }}
        />
        <Button variant="outlined" component="label" sx={{ marginTop: 2 }}>
          Change Profile Image
          <input type="file" hidden onChange={handleImageUpload} />
        </Button>
        {editMode ? (
          <>
            <TextField
              name="firstName"
              label="First Name"
              fullWidth
              variant="outlined"
              value={profile?.firstName || ""}
              onChange={handleInputChange}
              sx={{ marginTop: 2 }}
            />
            <TextField
              name="lastName"
              label="Last Name"
              fullWidth
              variant="outlined"
              value={profile?.lastName || ""}
              onChange={handleInputChange}
              sx={{ marginTop: 2 }}
            />
            <TextField
              name="email"
              label="Email"
              fullWidth
              variant="outlined"
              value={profile?.email || ""}
              onChange={handleInputChange}
              sx={{ marginTop: 2 }}
            />
            <TextField
              name="mobile"
              label="Mobile"
              fullWidth
              variant="outlined"
              value={profile?.mobile || ""}
              onChange={handleInputChange}
              sx={{ marginTop: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveProfile}
              sx={{ marginTop: 2, borderRadius: "20px" }}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h5" sx={{ marginTop: 2 }}>
              {profile?.firstName} {profile?.lastName}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              UI Designer
            </Typography>
            <Typography sx={{ marginTop: 2 }}>{profile?.email}</Typography>
            <Typography sx={{ marginTop: 1 }}>{profile?.mobile}</Typography>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleEditToggle}
              sx={{ marginTop: 2, borderRadius: "20px" }}
            >
              Edit Profile
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleLogOut}
              sx={{ marginTop: 2, borderRadius: "20px", ml: 1 }}
            >
              Logout
            </Button>
          </>
        )}
      </Card>
    </Grid>
  );
};

export default SideBar;