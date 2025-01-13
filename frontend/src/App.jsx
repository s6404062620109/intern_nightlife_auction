import { Route, Routes } from 'react-router-dom';

import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/home/index';
import Venue from './pages/venue';
import Auction from './pages/auction';
import Signin from './pages/authenticator/signIn/index';
import SignUp from './pages/authenticator/signUp';
import VenueDetail from './pages/venueDetails';
import Bidauction from './pages/bidAuction';

function App() {

  return (
    <div className='container'>
      <Navbar/>

      <div className='content'>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/venue' element={<Venue/>}/>
          <Route path='/venuedetail/:id' element={<VenueDetail/>}/>
          <Route path='/auction/:tableId' element={<Auction/>}/>
          <Route path='/auction/:tableId/bidauction/:auctionId' element={<Bidauction/>}/>
          <Route path='/signin' element={<Signin/>}/>
          <Route path='/signup' element={<SignUp/>}/>
        </Routes>
      </div>
    </div>
  )
}

export default App
