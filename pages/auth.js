import { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Container, TextField, Typography, Link, Grid, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, firestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

const Auth = () => {
    const [isSignUp, setIsSignUp] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const router = useRouter();

    const handleAuth = async (event) => {
        event.preventDefault();
        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await updateProfile(user, { displayName: name });
                await setDoc(doc(firestore, 'users', user.uid), { name });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            router.push('./Inventory');
        } catch (error) {
            console.error("Error in authentication", error);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
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
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                </Typography>
                <Box component="form" onSubmit={handleAuth} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        {isSignUp && (
                            <Grid item xs={12}>
                                <TextField
                                    autoComplete="name"
                                    name="name"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Name"
                                    autoFocus
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
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
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link href="#" variant="body2" onClick={() => setIsSignUp(!isSignUp)}>
                                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
};

export default Auth;
