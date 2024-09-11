import React, { useState, useEffect } from "react";
import { Grid, Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Education from "./components/Education";
import Experience from "./components/Experience";
import SideBar from "./components/SideBar";
import Summary from "./components/Summary";
import Skills from "./components/Skills";
import CertificationDialog from "./components/Certification";
import { auth, db } from "../src/Database/firebaseConfig"; 
import { onAuthStateChanged, signOut } from "firebase/auth"; 
import { doc, getDoc } from "firebase/firestore"; 
import { toast } from "react-hot-toast"; 
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4caf50",
    },
    secondary: {
      main: "#ff5722",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h5: { fontWeight: 700 },
    body1: { fontWeight: 500 },
  },
});

const ProfilePage = () => {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    bio: "",
  });
  const [user, setUser] = useState(null); // Track the authenticated user
  const navigate = useNavigate();

  // Fetch user profile data from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set authenticated user

        try {
          const userRef = doc(db, "users", currentUser.uid); // Reference to the user's document
          const userDoc = await getDoc(userRef); // Fetch the document

          if (userDoc.exists()) {
            const data = userDoc.data();
            setProfile({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: currentUser.email || "",
              mobile: data.mobile || "",
              bio: data.bio || "",
            });
          } else {
            console.error("No user document found"); // Log if document does not exist
            setProfile({
              firstName: "",
              lastName: "",
              email: currentUser.email || "",
              mobile: "",
              bio: "",
            });
            toast.error("No profile data found. Please complete your profile.");
          }
        } catch (error) {
          console.error("Error fetching user document:", error); // Log any errors
          toast.error("Failed to fetch profile data. Please try again.");
        }
      } else {
        setUser(null);
        setProfile({
          firstName: "",
          lastName: "",
          email: "",
          mobile: "",
          bio: "",
        });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      navigate("/"); // Redirect to home page
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 4, backgroundColor: "#f4f2ee", height: "auto" }}>
        <Grid container spacing={4}>
          {/* Left Side: Profile Section */}
          <SideBar
            profile={profile}
            setProfile={setProfile}
            handleInputChange={handleInputChange}
            editMode={editMode}
            handleEditToggle={handleEditToggle}
            user={user} // Pass the user to SideBar
            handleLogOut={handleLogOut} // Pass handleLogOut to SideBar
          />

          {/* Right Side: Summary, Education, Experience */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Summary Section */}
              <Summary
                profile={profile}
                handleInputChange={handleInputChange}
                editMode={editMode}
                handleEditToggle={handleEditToggle}
              />

              {/* Education Section */}
              <Education />

              {/* Experience Section */}
              <Experience />

              {/* Skills */}
              <Skills />

              {/* Certification */}
              <CertificationDialog />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default ProfilePage;
