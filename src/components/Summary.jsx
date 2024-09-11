import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Edit } from "@mui/icons-material";
import * as Constants from "../Constants.js";
import { db } from "../Database/firebaseConfig.js"; // Import Firestore
import { doc, setDoc, getDoc } from "firebase/firestore"; // Import Firestore methods
import { toast } from "react-hot-toast"; // For notifications
import { useAuthState } from "react-firebase-hooks/auth"; // Firebase auth hook
import { auth } from "../Database/firebaseConfig.js"; // Import Firebase Auth

const Summary = ({ profile, handleInputChange, setProfile }) => {
  const [editMode, setEditMode] = useState(false);
  const [user] = useAuthState(auth); // Get the current user

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSaveBio = async () => {
    if (!user || !user.uid) {
      toast.error("User not authenticated.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid); // Reference to the user's document

      // Check if the document exists
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        // If it exists, update it
        await setDoc(userRef, { bio: profile.bio }, { merge: true }); // Update only the 'bio' field
        toast.success("Bio updated successfully!");
      } else {
        // If it doesn't exist, create it
        await setDoc(userRef, { bio: profile.bio });
        toast.success("Profile created with updated bio!");
      }

      handleEditToggle(); // Exit edit mode after saving
    } catch (error) {
      console.error("Error updating bio: ", error);
      toast.error("Failed to update bio.");
    }
  };

  return (
    <Grid item xs={12}>
      <Card sx={{ boxShadow: 3, borderRadius: "20px" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" fontWeight={"bold"}>
              {Constants.TEXT_SUMM}
            </Typography>
            <IconButton>
              <Edit onClick={handleEditToggle} />
            </IconButton>
          </Box>
          {editMode ? (
            <TextField
              name="bio"
              label="Bio"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={profile.bio}
              onChange={handleInputChange}
              sx={{ marginTop: 2 }}
            />
          ) : (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ marginTop: 1 }}
            >
              {profile.bio}
            </Typography>
          )}
          <Button
            variant="outlined"
            color="success"
            onClick={handleSaveBio}
            sx={{ marginTop: 2, display: editMode ? "flex" : "none" }}
          >
            {Constants.ACTION_SAVE}
          </Button>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default Summary;
