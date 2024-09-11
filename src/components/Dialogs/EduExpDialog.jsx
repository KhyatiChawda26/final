import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Box, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const EduExpDialog = ({
  handleClose,
  open,
  type, // "Education" or "Experience"
  editData,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    startDate: null,
    endDate: null,
  });
  
  const [expFormData, setExpFormData] = useState({
    company: "",
    position: "",
    startDate: null,
    endDate: null,
  });
  
  useEffect(() => {
    // Pre-fill form data when editing
    if (editData) {
      if (type === "Education") {
        setFormData({
          institution: editData.institution || "",
          degree: editData.degree || "",
          startDate: editData.startDate ? dayjs(editData.startDate) : null,
          endDate: editData.endDate ? dayjs(editData.endDate) : null,
        });
      } else if (type === "Experience") {
        setExpFormData({
          company: editData.company || "",  // Correct field for experience data
          position: editData.position || "",
          startDate: editData.startDate ? dayjs(editData.startDate) : null,
          endDate: editData.endDate ? dayjs(editData.endDate) : null,
        });
      }
    }
  }, [editData, type]);
  

  const handleChange = (field, value) => {
    if (type === "Education") {
      setFormData((prevData) => ({ ...prevData, [field]: value }));
    } else if (type === "Experience") {
      setExpFormData((prevData) => ({ ...prevData, [field]: value }));  // Correct state for experience
    }
  };
  

  const handleDelete = () => {
    toast(
      (t) => (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          Are you sure you want to delete this item?
          <Button
            onClick={() => {
              onDelete(editData.id); // Call onDelete if confirmed
              toast.dismiss(t.id); // Dismiss the toast
              toast.success(`${type} deleted successfully`);
              handleClose(); // Close the dialog
            }}
            variant="text"
            style={{ marginLeft: "10px", color: "red" }}
          >
            Yes
          </Button>
          <Button
            onClick={() => {
              toast.dismiss(t.id); // Dismiss the toast
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
  };

  const handleSave = () => {
    if (
      (type === "Education" && (!formData.institution || !formData.degree)) ||
      (type === "Experience" && (!expFormData.company || !expFormData.position)) ||
      !(
        (type === "Education" && formData.startDate && formData.endDate) ||
        (type === "Experience" && expFormData.startDate && expFormData.endDate)
      )
    ) {
      toast.error("Please fill out all required fields");
      return;
    }
  
    // Format the start and end dates based on the type
    const formattedStartDate =
      type === "Education"
        ? formData.startDate
          ? formData.startDate.format("YYYY/MM/DD")
          : null
        : expFormData.startDate
        ? expFormData.startDate.format("YYYY/MM/DD")
        : null;
  
    const formattedEndDate =
      type === "Education"
        ? formData.endDate
          ? formData.endDate.format("YYYY/MM/DD")
          : null
        : expFormData.endDate
        ? expFormData.endDate.format("YYYY/MM/DD")
        : null;
  
    const finalData =
      type === "Education"
        ? {
            institution: formData.institution,
            degree: formData.degree,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          }
        : {
            company: expFormData.company,  // Correct field for experience
            position: expFormData.position,  // Correct field for experience
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          };
  
    onSave(finalData); // Pass the correctly structured data to the parent
    handleClose();
  };
  
  return (
    <Dialog onClose={handleClose} open={open} fullWidth>
      <DialogTitle>
        {editData ? `Edit ${type}` : `Add ${type}`}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label={type === "Education" ? "School/College" : "Company Name"}
          variant="outlined"
          fullWidth
          value={type === "Education" ? formData.institution : expFormData.company} // Corrected from "expFormData.comapny" to "expFormData.company"
          onChange={(e) =>
            handleChange(
              type === "Education" ? "institution" : "company",
              e.target.value
            )
          }
          sx={{ mb: 2 }}
        />
        <TextField
          label={type === "Education" ? "Degree" : "Position"}
          variant="outlined"
          fullWidth
          value={type === "Education" ? formData.degree : expFormData.position}
          onChange={(e) =>
            handleChange(
              type === "Education" ? "degree" : "position",
              e.target.value
            )
          }
          sx={{ mb: 2 }}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start Date"
            value={
              type === "Education" ? formData.startDate : expFormData.startDate
            }
            onChange={(date) => handleChange("startDate", date)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
          <DatePicker
            label="End Date"
            value={
              type === "Education" ? formData.endDate : expFormData.endDate
            }
            onChange={(date) => handleChange("endDate", date)}
            renderInput={(params) => <TextField {...params} fullWidth />}
            sx={{ ml: 1 }}
          />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-end", display: "flex" }}>
        {editData && (
          <Button
            onClick={handleDelete}
            variant="outlined"
            color="error"
            sx={{ marginRight: "auto" }}
          >
            Delete
          </Button>
        )}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            {editData ? "Save Changes" : "Add"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EduExpDialog;