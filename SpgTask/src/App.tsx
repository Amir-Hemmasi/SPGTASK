import { useState } from 'react';
// import reactLogo from './assets/react.svg';
import './App.css';
import Users from './components/users';
import SignIn from './components/users/login';
import Header from './components/header';

function App() {
  const [user, setUser] = useState({
    email: '',
    password: '',
    id: '',
    token: '',
  });

  return (
    <>
      {user.id !== '' && <Header user={user} />}
      <div className='App'>
        {user.id !== '' && <Users user={user} />}
        {user.id === '' && (
          <SignIn
            onLogin={(user: {
              email: string;
              password: string;
              id: string;
              token: string;
            }) => {
              setUser(user);
            }}
          />
        )}
      </div>
    </>
  );
}

export default App;
