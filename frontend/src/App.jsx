import { Route, Routes } from 'react-router-dom';

import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/home/index';
import Venue from './pages/venue';
import Auction from './pages/auction';
import Signin from './pages/authenticator/signIn/index';
import SignUp from './pages/authenticator/signUp';

function App() {

  return (
    <div className='container'>
      <Navbar/>

      <div className='content'>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/venue' element={<Venue/>}/>
          <Route path='/auction' element={<Auction/>}/>
          <Route path='/signin' element={<Signin/>}/>
          <Route path='/signup' element={<SignUp/>}/>
        </Routes>
      </div>
    </div>
  )
}

export default App
