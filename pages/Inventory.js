'use client'
import { useState, useEffect } from "react";
import { firestore, auth, signOutUser } from "@/firebase";
import { Box, Modal, Button, Stack, TextField, Typography, Container, createTheme, ThemeProvider, IconButton, InputBase, Menu, MenuItem, Fab } from "@mui/material";
import { collection, getDocs, query, doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/router';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';

const theme = createTheme();

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        updateInventory(user.uid);
      } else {
        router.push('/auth');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const updateInventory = async (uid) => {
    try {
      const snapshot = query(collection(firestore, 'users', uid, 'inventory'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({
          name: doc.id,
          ...doc.data()
        });
      });
      setInventory(inventoryList);
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  }

  const addItem = async (item) => {
    if (!user) {
      console.error("No user logged in");
      return;
    }

    const docRef = doc(collection(firestore, 'users', user.uid, 'inventory'), item);
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
    if (!user) {
      console.error("No user logged in");
      return;
    }

    const docRef = doc(collection(firestore, 'users', user.uid, 'inventory'), item);
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

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/auth');
  }

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="lg" sx={{ width: { xs: '100%', lg: '70%' } }}>
        {user && (
          <Box
            width="100%"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap={2}
          >
            <Box
              width="100%"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={2}
              bgcolor="#ADD8E6"
            >
              <Typography variant="h5">{user.displayName}'s Pantry</Typography>
              <IconButton onClick={handleMenuOpen}>
                <AccountCircleIcon fontSize="large" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
              </Menu>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              width="100%"
            // mb={2}
            >
              {searchOpen ? (
                <Box display="flex" alignItems="center" width="100%">
                  <InputBase
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <IconButton onClick={() => setSearchOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              ) : (
                <>
                  <Typography variant="h5" color='#333'>Items</Typography>
                  <IconButton onClick={() => setSearchOpen(true)}>
                    <SearchIcon />
                  </IconButton>
                </>
              )}
            </Box>
            <Box border="1px solid #333" width="100%">
              <Stack width="100%" height="300px" spacing={0} overflow="auto">
                {filteredInventory.map(({ name, quantity }) => (
                  <Box
                    key={name}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    bgcolor="#f0f0f0"
                    padding={2}
                    borderBottom="1px solid #333"
                  >
                    <Typography variant="h5" color="#333">
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button variant="contained" onClick={() => removeItem(name)}>-</Button>
                      <Typography variant="h6" color="#333">{quantity}</Typography>
                      <Button variant="contained" onClick={() => addItem(name)}>+</Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Fab
              color="primary"
              aria-label="add"
              sx={{ position: 'fixed', bottom: 16, right: 16 }}
              onClick={handleOpen}
            >
              <AddIcon />
            </Fab>
          </Box>
        )}
      </Container>
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
              onChange={(e) => setItemName(e.target.value)}
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
    </ThemeProvider>
  );
}
