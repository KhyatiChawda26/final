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
  deleteField,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";

const Education = () => {
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Adjust as needed

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(true); // Set loading true when starting to fetch data

      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setEducation(data.education || []);
          } else {
            console.error("No user document found");
            setEducation([]);
          }
        } catch (error) {
          console.error("Error fetching education data:", error);
          toast.error("Failed to fetch education data.");
        }
      } else {
        setEducation([]);
      }
      setLoading(false); // Set loading false after data fetch is complete
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const totalPages = Math.ceil(education.length / itemsPerPage);
  console.log("totalpages of education: ", totalPages);
  const startIndex = (currentPage - 1) * itemsPerPage;
  console.log("startIndex of education: ", startIndex);
  const itemsToShow = education.slice(startIndex, startIndex + itemsPerPage);
  console.log("itemstoshow of education: ", itemsToShow);

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
          const updatedEducation = [...education];
          updatedEducation[editIndex] = newData;
          setEducation(updatedEducation);

          await updateDoc(userRef, {
            education: updatedEducation,
          });
        } else {
          const newEducation = { ...newData, id: Date.now().toString() };
          setEducation((prevEdu) => {
            const updatedEducation = [...prevEdu, newEducation];
            const newPage = Math.ceil(updatedEducation.length / itemsPerPage);
            setCurrentPage(newPage);
            return updatedEducation;
          });

          await updateDoc(userRef, {
            education: arrayUnion(newEducation),
          });
        }
        handleCloseDialog();
      } catch (error) {
        console.error("Error saving education data: ", error);
        toast.error("Failed to save education data.");
      }
    } else {
      toast.error("User not authenticated.");
    }
  };

  const handleDelete = async (id) => {
    if (user) {
      try {
        const updatedEducation = education.filter((edu) => edu.id !== id);
        setEducation(updatedEducation);

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          education: arrayRemove(education.find((edu) => edu.id === id)),
        });
      } catch (error) {
        console.error("Error deleting education data: ", error);
        toast.error("Failed to delete education data.");
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
              Education
            </Typography>
            <IconButton onClick={() => handleOpenDialog()}>
              <AddIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              minHeight: education.length > 3 ? 340 : "none",
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
                {itemsToShow.map((edu, index) => (
                  <TimelineItem key={edu.id}>
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
                        <Typography variant="body2">{edu.degree}</Typography>
                        <IconButton
                          onClick={() =>
                            handleOpenDialog(
                              education.findIndex((e) => e.id === edu.id)
                            )
                          }
                        >
                          <Edit color="action" fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        {edu.institution}, {edu.startDate} - {edu.endDate}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            )}
          </Box>

          {education.length > itemsPerPage && (
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
          type="Education"
          editData={editIndex !== null ? education[editIndex] : null}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </Grid>
  );
};

export default Education;
