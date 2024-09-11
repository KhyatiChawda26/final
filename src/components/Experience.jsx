import React, { useState, useEffect } from "react";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@mui/lab";
import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
  Pagination,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import EduExpDialog from "./Dialogs/EduExpDialog";
import { db, auth } from "../Database/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";

const Experience = () => {
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(true);

      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setExperience(data.experience || []);
          } else {
            console.error("No user document found");
            setExperience([]);
          }
        } catch (error) {
          console.error("Error fetching experience data:", error);
          toast.error("Failed to fetch experience data.");
        }
      } else {
        setExperience([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const totalPages = Math.ceil(experience.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const itemsToShow = experience.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenDialog = (index = null) => {
    setEditIndex(index);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditIndex(null);
  };

  const handleSave = async (newData) => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        if (editIndex !== null) {
          const updatedExperience = [...experience];
          updatedExperience[editIndex] = newData;
          setExperience(updatedExperience);

          await updateDoc(userRef, {
            experience: updatedExperience,
          });
        } else {
          const newExperience = { ...newData, id: Date.now().toString() };
          setExperience((prevExp) => {
            const updatedExperience = [...prevExp, newExperience];
            const newPage = Math.ceil(updatedExperience.length / itemsPerPage);
            setCurrentPage(newPage);
            return updatedExperience;
          });

          await updateDoc(userRef, {
            experience: arrayUnion(newExperience),
          });
        }
        handleCloseDialog();
      } catch (error) {
        console.error("Error saving experience data: ", error);
        toast.error("Failed to save experience data.");
      }
    } else {
      toast.error("User not authenticated.");
    }
  };

  const handleDelete = async (id) => {
    if (user) {
      try {
        const updatedExperience = experience.filter((exp) => exp.id !== id);
        setExperience(updatedExperience);

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          experience: arrayRemove(experience.find((exp) => exp.id === id)),
        });
      } catch (error) {
        console.error("Error deleting experience data: ", error);
        toast.error("Failed to delete experience data.");
      }
    } else {
      toast.error("User not authenticated.");
    }
  };

  return (
    <Grid item xs={12} md={6}>
      <Card sx={{ boxShadow: 3, borderRadius: "20px" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" fontWeight="bold">
              Experience
            </Typography>
            <IconButton onClick={() => handleOpenDialog()}>
              <AddIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              minHeight: experience.length > 3 ? 340 : "none",
              maxHeight: 340,
              display: "flex",
              flexDirection: "column",
              justifyContent:
                itemsToShow.length < 3 ? "flex-start" : "space-between",
            }}
          >
            {loading ? (
              <Typography>Loading...</Typography>
            ) : (
              <Timeline position="alternate">
                {itemsToShow.map((exp, index) => {
                  return (
                    <TimelineItem key={exp.id}>
                      <TimelineSeparator>
                        <TimelineDot sx={{ backgroundColor: "#c7000b" }} />
                        {index < itemsToShow.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2">
                            {exp.position} ~ {exp.company}  
                          </Typography>

                          <IconButton
                            onClick={() =>
                              handleOpenDialog(
                                experience.findIndex((e) => e.id === exp.id)
                              )
                            }
                          >
                            <Edit color="action" fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {exp.startDate} - {exp.endDate}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  );
                })}
              </Timeline>
            )}
          </Box>

          {experience.length > itemsPerPage && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {openDialog && (
        <EduExpDialog
          handleClose={handleCloseDialog}
          open={openDialog}
          type="Experience"
          editData={editIndex !== null ? experience[editIndex] : null}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </Grid>
  );
};

export default Experience;
