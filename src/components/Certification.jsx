import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Grid,
  Card,
  CardContent,
  Pagination,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CertificationDialog from "./Dialogs/CertificationDialog";
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

const Certification = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [certifications, setCertifications] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCertification, setCurrentCertification] = useState({
    id: null,
    name: "",
    issuer: "",
    issueDate: "",
  });

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
            setCertifications(data.certifications || []);
          } else {
            console.error("No user document found");
            setCertifications([]);
          }
        } catch (error) {
          console.error("Error fetching certifications data:", error);
          toast.error("Failed to fetch certifications data.");
        }
      } else {
        setCertifications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenDialog = (cert = null) => {
    if (cert) {
      setCurrentCertification(cert);
      setIsEditing(true);
    } else {
      setCurrentCertification({
        id: null,
        name: "",
        issuer: "",
        issueDate: "",
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCertification({ id: null, name: "", issuer: "", issueDate: "" });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        if (isEditing) {
          const updatedCertifications = certifications.map((cert) =>
            cert.id === currentCertification.id ? currentCertification : cert
          );
          await updateDoc(userRef, { certifications: updatedCertifications });
          toast.success("Certification Updated Successfully");
          setCertifications(updatedCertifications);
        } else {
          const newCertification = {
            ...currentCertification,
            id: Date.now().toString(),
          };
          const updatedCertifications = [...certifications, newCertification];
          await updateDoc(userRef, {
            certifications: arrayUnion(newCertification),
          });
          toast.success("Certification Added Successfully");
          setCertifications(updatedCertifications);
        }
        handleCloseDialog();
      } catch (error) {
        console.error("Error saving certification data: ", error);
        toast.error("Failed to save certification data.");
      }
    } else {
      toast.error("User not authenticated.");
    }
  };

  const handleDelete = (id) => {
    if (user) {
      const certificationToDelete = certifications.find(
        (cert) => cert.id === id
      );

      if (!certificationToDelete) {
        toast.error("Certification not found.");
        return;
      }

      // Show confirmation before deleting
      toast(
        (t) => (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            Are you sure you want to delete this item?
            <Button
              onClick={async () => {
                try {
                  const updatedCertifications = certifications.filter(
                    (cert) => cert.id !== id
                  );
                  const userRef = doc(db, "users", user.uid);
                  await updateDoc(userRef, {
                    certifications: arrayRemove(certificationToDelete),
                  });

                  setCertifications(updatedCertifications);
                  toast.dismiss(t.id); // Dismiss the confirmation toast
                  toast.success("Certification deleted successfully.");
                } catch (error) {
                  console.error("Error deleting certification data: ", error);
                  toast.error("Failed to delete certification data.");
                }
              }}
              variant="text"
              style={{ marginLeft: "10px", color: "red" }}
            >
              Yes
            </Button>
            <Button
              onClick={() => {
                toast.dismiss(t.id); // Dismiss the confirmation toast
              }}
              style={{ marginLeft: "10px" }}
            >
              No
            </Button>
          </Box>
        ),
        {
          duration: Infinity, // Keep toast visible until manually dismissed
        }
      );
    } else {
      toast.error("User not authenticated.");
    }
  };

  const totalPages =
    certifications.length > 0
      ? Math.ceil(certifications.length / itemsPerPage)
      : 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const itemsToShow = certifications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    if (totalPages === 0 || currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <Grid item xs={12} md={6}>
      <Card sx={{ boxShadow: 3, borderRadius: "20px" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" fontWeight="bold">
              Certifications
            </Typography>
            <IconButton onClick={() => handleOpenDialog()}>
              <AddIcon />
            </IconButton>
          </Box>
          <List>
            {loading ? (
              <Typography>Loading...</Typography>
            ) : (
              itemsToShow.map((cert) => (
                <ListItem key={cert.id}>
                  <ListItemAvatar>
                    <Avatar>{cert.name[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={cert.name}
                    secondary={`${cert.issuer} - ${cert.issueDate}`}
                  />
                  <IconButton onClick={() => handleOpenDialog(cert)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(cert.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))
            )}
          </List>

          {certifications.length > itemsPerPage && (
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          )}
        </CardContent>
      </Card>

      {openDialog && (
        <CertificationDialog
          open={openDialog}
          handleCloseDialog={handleCloseDialog}
          handleSave={handleSave}
          currentCertification={currentCertification}
          setCurrentCertification={setCurrentCertification}
          isEditing={isEditing}
        />
      )}
    </Grid>
  );
};

export default Certification;
