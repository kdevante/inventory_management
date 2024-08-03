'use client'
import { useState, useEffect } from "react";
import { firestore, auth, signInWithEmail, signUpWithEmail, signOutUser, signInWithGoogle } from "@/firebase";
import { Avatar, Button, CssBaseline, TextField, Link, Grid, Box, Typography, Container, Modal, Stack, makeStyles, createTheme, ThemeProvider } from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { collection, getDocs, query, doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const theme = createTheme();

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData && userData.name) {
            setUser({ ...user, name: userData.name });
          } else {
            console.error("User document does not have a name field.");
            setUser({ ...user, name: "User" }); // default name if name field is missing
          }
        } else {
          console.error("User document does not exist.");
          setUser({ ...user, name: "User" }); // default name if document does not exist
        }

        updateInventory(user.uid);
      } else {
        setUser(null);
        setInventory([]);
      }
    });

    return () => unsubscribe();
  }, []);


  const updateInventory = async (userId) => {
    const snapshot = query(collection(firestore, `users/${userId}/inventory`));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data()
      });
    });
    setInventory(inventoryList);
  }

  const addItem = async (item) => {
    if (!user) return;

    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory(user.uid);
  }

  const removeItem = async (item) => {
    if (!user) return;

    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }

    await updateInventory(user.uid);
  }

  const handleAuth = async () => {
    if (isSignUp) {
      await signUpWithEmail(email, password, name);
    } else {
      await signInWithEmail(email, password);
    }
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {isSignUp ? "Sign Up" : "Sign In"}
          </Typography>
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAuth(); }} noValidate sx={{ mt: 1 }}>
            {isSignUp && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2" onClick={() => setIsSignUp(!isSignUp)}>
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={signInWithGoogle}
            >
              Sign In with Google
            </Button>
          </Box>
        </Box>
      </Container>

      {user && (
        <Box
          width="100vw"
          height="100vh"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={2}
        >
          <Typography variant="h4">Welcome Back, {user.name}!</Typography>
          <Button variant="contained" onClick={signOutUser}>
            Sign Out
          </Button>
          <Modal open={open} onClose={handleClose}>
            <Box
              position="absolute"
              top="50%"
              left="50%"
              width={400}
              bgcolor="beige"
              border="2px solid black"
              boxShadow={24}
              padding={4}
              flexDirection="column"
              gap={3}
              sx={{
                transform: "translate(-50%,-50%)",
              }}
            >
              <Typography variant="h6">Add Item</Typography>
              <Stack width="100%" direction="row" spacing={2}>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => {
                    setItemName(e.target.value);
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    addItem(itemName);
                    setItemName('');
                    handleClose();
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Modal>
          <Button
            variant="contained"
            onClick={handleOpen}
          >
            Add New Item
          </Button>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Box border="1px solid #333">
            <Box
              width="800px"
              height="100px"
              bgcolor="#ADD8E6"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h2" color='#333'>Inventory Items</Typography>
            </Box>
            <Stack width="800px" height="300px" spacing={2} overflow="auto">
              {
                filteredInventory.map(({ name, quantity }) => (
                  <Box
                    key={name}
                    width="100%"
                    minHeight="150px"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    bgcolor="#f0f0f0"
                    padding={5}
                  >
                    <Typography variant="h3" color="#333" textAlign="center">
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography variant="h3" color="#333" textAlign="center">
                      {quantity}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Button variant="contained" onClick={() => addItem(name)}>
                        Add
                      </Button>
                      <Button variant="contained" onClick={() => removeItem(name)}>
                        Remove
                      </Button>
                    </Stack>
                  </Box>
                ))
              }
            </Stack>
          </Box>
        </Box>
      )}
    </ThemeProvider>
  );
}
