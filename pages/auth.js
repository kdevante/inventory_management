'use client'
import React, { useState } from 'react';
import { auth, signInWithEmail, signUpWithEmail, signOutUser, signInWithGoogle } from "@/firebase";
import { Avatar, Button, CssBaseline, TextField, Link, Grid, Box, Typography, Container, createTheme, ThemeProvider } from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/router';

const theme = createTheme();

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();

    const handleAuth = async () => {
        if (isSignUp) {
            await signUpWithEmail(email, password, name);
        } else {
            await signInWithEmail(email, password);
        }
        router.push('./Inventory');
    }

    const handleGoogleSignIn = async () => {
        await signInWithGoogle();
        router.push('./Inventory');
    }

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
                            onClick={handleGoogleSignIn}
                        >
                            Sign In with Google
                        </Button>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
