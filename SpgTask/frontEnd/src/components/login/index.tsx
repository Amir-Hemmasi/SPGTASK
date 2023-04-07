import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import Notification from '../notification';
import axios from 'axios';
const theme = createTheme();
type loginPageType = {
  onLogin: (user: {
    email: string;
    password: string;
    id: string;
    token: string;
  }) => void;
};

export default function SignIn(props: loginPageType) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [user, setUser] = React.useState({
    email: '',
    password: '',
    id: '',
    token: '',
  });
  const [showNoti, setShowNoti] = React.useState<boolean>(false);
  const [notiMessage, setNotiMessage] = React.useState<string>('');
  const [notiType, setNotiType] = React.useState<string>('');

  const login = (email: string, password: string) => {
    setIsLoading(true);
    if (email.trim() === '' || password.trim() === '') {
      console.log('OOPS!');
      return;
    }
    let url =
      'https://pei26i9x39.execute-api.ca-central-1.amazonaws.com/dev-amirh/login';

    setUser({ email: '', password: '', id: '', token: '' });
    props.onLogin(user);

    let resp = axios.post(url, { email: email, password: password });
    resp
      .then((res) => {
        setNotiType('success');
        setNotiMessage(
          `Welcome ${res.data.user.email
            .split('@')[0]
            .replace(/^\w/, (c: any) => c.toUpperCase())} `
        );
        setShowNoti(true);
        setUser(res.data.user);
        props.onLogin(res.data.user);
      })
      .catch((e) => {
        setNotiType('error');
        setNotiMessage(`Email or Password was not correct. Please try again`);
        setShowNoti(true);
        setUser({ email: '', password: '', id: '', token: '' });
      })
      .finally(() => setIsLoading(false));
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    login(
      (data.get('email') ?? '') as string,
      (data.get('password') ?? '') as string
    );
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component='main' maxWidth='xs'>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component='h1' variant='h5'>
            Sign in
          </Typography>
          <Box
            component='form'
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin='normal'
              required
              fullWidth
              id='email'
              label='Email Address'
              name='email'
              autoComplete='email'
              autoFocus
            />
            <TextField
              margin='normal'
              required
              fullWidth
              name='password'
              label='Password'
              type='password'
              id='password'
              autoComplete='current-password'
            />
            <FormControlLabel
              control={<Checkbox value='remember' color='primary' />}
              label='Remember me'
            />
            <LoadingButton
              type='submit'
              fullWidth
              size='small'
              loading={isLoading}
              disabled={isLoading}
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </LoadingButton>
          </Box>
        </Box>
      </Container>
      <Notification
        onClose={() => {
          setShowNoti(false);
        }}
        message={notiMessage}
        showNoti={showNoti}
        type={notiType}
      ></Notification>
    </ThemeProvider>
  );
}
