import { Route, Routes } from 'react-router-dom';

import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/home/index';
import Venue from './pages/venue';
import Signin from './pages/authenticator/signIn/index';
import SignUp from './pages/authenticator/signUp';
import VenueDetail from './pages/venueDetails';
import Bidauction from './pages/bidAuction';
import Reset from './pages/authenticator/reset';
import ChangePassword from './pages/authenticator/changepassword';
import Auction from './pages/auction';
import MyVenue from './pages/myvenue';
import MyAuction from './pages/myAuction';

function App() {

  return (
    <div className='container'>
      <Navbar/>

      <div className='content'>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/venue' element={<Venue/>}/>
          <Route path='/myvenue' element={<MyVenue/>}/>
          <Route path='/venuedetail/:id' element={<VenueDetail/>}/>
          <Route path='/venuedetail/:id/table' element={<Auction/>}/>
          <Route path='/venuedetail/:id/tables/:ownerId/' element={<MyAuction/>}/>
          <Route path='/auction/:tableId/bidauction/:auctionId' element={<Bidauction/>}/>
          <Route path='/signin' element={<Signin/>}/>
          <Route path='/signup' element={<SignUp/>}/>
          <Route path='/reset' element={<Reset/>}/>
          <Route path='/auth/change-password' element={<ChangePassword/>}/>
        </Routes>
      </div>
    </div>
  )
}

export default App
