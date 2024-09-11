import React, { useState, useEffect } from "react";
import { Box, IconButton, Typography, Avatar, Chip, Grid, Card, CardContent } from "@mui/material";
import SkillsDialog from "./Dialogs/SkillsDialog";
import AddIcon from "@mui/icons-material/Add";
import { db, auth } from "../Database/firebaseConfig"; // Adjust the import path as needed
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";

const Skills = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchSkills(currentUser);
      } else {
        setLoading(false);
        toast.error("User not authenticated.");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchSkills = async (user) => {
    setLoading(true);

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setSkills(data.skills || []);
      } else {
        setSkills([]);
      }
    } catch (error) {
      console.error("Error fetching skills data:", error);
      toast.error("Failed to fetch skills data.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveSkills = async (newSkills) => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          skills: newSkills
        });
        setSkills(newSkills);
        setOpenDialog(false);
      } catch (error) {
        console.error("Error saving skills data:", error);
        toast.error("Failed to save skills data.");
      }
    } else {
      toast.error("User not authenticated.");
    }
  };

  if (loading) {
    return (
      <Grid item xs={12} md={6}>
        <Card sx={{ boxShadow: 3, borderRadius: "20px", textAlign: 'center', padding: 2 }}>
          <CardContent>
            <Typography>Loading...</Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  }
  

  return (
    <Grid item xs={12} md={6}>
      <Card sx={{ boxShadow: 3, borderRadius: "20px" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" fontWeight="bold">
              Skills
            </Typography>
            <IconButton onClick={handleOpenDialog}>
              <AddIcon />
            </IconButton>
          </Box>

          {/* Display saved skills as chips */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                variant="outlined"
                avatar={<Avatar>{skill.charAt(0).toUpperCase()}</Avatar>}
              />
            ))}
          </Box>

          {/* SkillsDialog for adding/editing skills */}
          {openDialog && (
            <SkillsDialog
              oldSkills={skills}
              open={openDialog}
              handleClose={handleCloseDialog}
              handleSave={handleSaveSkills}
            />
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default Skills;
